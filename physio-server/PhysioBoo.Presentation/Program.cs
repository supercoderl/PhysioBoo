
using Aikido.Zen.DotNetCore;
using HealthChecks.ApplicationStatus.DependencyInjection;
using HealthChecks.UI.Client;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.gRPC;
using PhysioBoo.Domain.Extensions;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Extensions;
using PhysioBoo.Presentation.Endpoints;
using PhysioBoo.Presentation.Extensions;
using PhysioBoo.Presentation.Warmup;
using PhysioBoo.ServiceDefaults;
using StackExchange.Profiling.Storage;

namespace PhysioBoo.Presentation
{
    public class Program
    {
        public static void Main(string[] args)
        {
            System.Diagnostics.Stopwatch totalTimer = System.Diagnostics.Stopwatch.StartNew();
            System.Diagnostics.Stopwatch stepTimer = System.Diagnostics.Stopwatch.StartNew();

            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
            LogStep("Builder created", ref stepTimer);

            bool isAspire = builder.Configuration["ASPIRE_ENABLED"] == "true";
            string? redisConnectionString =
                isAspire ? builder.Configuration["ConnectionStrings:Redis"] : builder.Configuration["RedisHostName"];
            RabbitMqConfiguration rabbitConfiguration = builder.Configuration.GetRabbitMqConfiguration();
            string? dbConnectionString = isAspire
                ? builder.Configuration["ConnectionStrings:Database"]
                : builder.Configuration["ConnectionStrings:DefaultConnection"];
            LogStep("Configuration loaded", ref stepTimer);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            LogStep("Controllers added", ref stepTimer);

            builder.Services.AddInfrastructure(builder.Configuration, "PhysioBoo.Infrastructure");
            LogStep("Infrastructure added", ref stepTimer);

            builder.Services.AddNotificationHandlers();
            builder.Services.AddApiUser();
            builder.Services.AddCommandHandlers();
            LogStep("Handlers added", ref stepTimer);

            builder.Services.AddAuth(builder.Configuration);
            LogStep("Auth configured", ref stepTimer);

            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddGrpc();
                builder.Services.AddGrpcReflection();
                builder.Services.AddSwagger();
                builder.Services.AddOpenApi();
                LogStep("gRPC configured", ref stepTimer);
            }

            builder.Services.AddQueryHandlers();
            LogStep("Query handlers added", ref stepTimer);

            builder.Services.AddSettings<MailSettings>(builder.Configuration, "Email");
            builder.Services.AddSettings<ServerSettings>(builder.Configuration, "Server");
            builder.Services.AddCSRFProtection(builder.Environment);
            builder.Services.AddEmail();
            builder.Services.AddServices();
            builder.Services.AddPhysioBooConsumers(rabbitConfiguration.Host, rabbitConfiguration.Username, rabbitConfiguration.Password);
            builder.Services.AddHostedService<WarmupConnection>();

            if (builder.Environment.IsProduction())
            {
                builder.Services.AddZenFirewall();

                builder.Services.ConfigureApplicationCookie(options =>
                {
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.None;
                });
            }

            #region Handle Reference Loop - Avoid Errors When Using EF Core Navigation Properties
            builder.Services.AddControllersWithViews().AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            });
            #endregion

            #region Health Checks
            if (builder.Environment.IsProduction())
            {
                builder.Services.AddHealthChecks()
                    .AddNpgSql(dbConnectionString!, name: "Postgres", timeout: TimeSpan.FromSeconds(2))
                    .AddApplicationStatus();
            }
            #endregion

            #region DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(dbConnectionString,
                    npgsqlOptions => npgsqlOptions
                        .MigrationsAssembly("PhysioBoo.Infrastructure")
                        .CommandTimeout(30)
                        .EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(5),
                            errorCodesToAdd: null)
                        .MinBatchSize(1)
                        .MaxBatchSize(100)
                );

                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTrackingWithIdentityResolution);

                if (builder.Environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                    options.LogTo(Console.WriteLine, LogLevel.Warning);
                }
            }, ServiceLifetime.Scoped);
            #endregion

            #region Cors
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", x =>
                {
                    x.SetIsOriginAllowed(x => _ = true)
                     .AllowAnyHeader()
                     .AllowAnyMethod()
                     .AllowCredentials();
                });
            });
            #endregion

            #region Cache
            if (builder.Environment.IsProduction() || !string.IsNullOrWhiteSpace(builder.Configuration["RedisHostName"]))
            {
                builder.Services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = builder.Configuration["RedisHostName"];
                    options.InstanceName = "PhysioBoo";
                    options.ConfigurationOptions = new StackExchange.Redis.ConfigurationOptions
                    {
                        ConnectTimeout = 3000,
                        SyncTimeout = 3000,
                        AbortOnConnectFail = false,
                        ConnectRetry = 3
                    };
                });
            }
            else
            {
                builder.Services.AddDistributedMemoryCache();
            }
            #endregion

            #region MediatR
            builder.Services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(
                    typeof(Program).Assembly,
                    typeof(ApplicationDbContext).Assembly,
                    typeof(PhysioBoo.Application.AssemblyMarker).Assembly,
                    typeof(PhysioBoo.Domain.AssemblyMarker).Assembly
                );
            });
            #endregion

            #region Mini Profiler & Logging 
            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddMemoryCache();
                builder.Services.AddMiniProfiler(options =>
                {
                    options.RouteBasePath = "/profiler";
                    options.Storage = new MemoryCacheStorage(
                        new MemoryCache(new MemoryCacheOptions()), // IMemoryCache
                        TimeSpan.FromMinutes(60)
                    );
                    options.TrackConnectionOpenClose = true;
                }).AddEntityFramework(); // Mini Profiler
                builder.Services.AddLogging(x => x.AddSimpleConsole(console =>
                {
                    console.TimestampFormat = "[yyyy-MM-ddTHH:mm:ss.fff]";
                    console.IncludeScopes = true;
                })); // Logging
            }
            else
            {
                builder.Services.AddLogging(x => x.AddJsonConsole()); // Logging
            }
            #endregion

            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            System.Diagnostics.Stopwatch startupTimer = System.Diagnostics.Stopwatch.StartNew();

            WebApplication app = builder.Build();
            LogStep("App built", ref stepTimer);

            app.MapDefaultEndpoints();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.MapGrpcReflectionService();
                app.UseMiniProfiler();

                // Map endpoints 
                app.MapDevEndpoints();
            }

            app.UseHttpsRedirection();

            app.UseCors("CorsPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            if (builder.Environment.IsProduction())
            {
                app.UseZenFirewall();
            }

            #region Map endpoints
            void MapHealthcareEndpoints(WebApplication app)
            {
                app.MapPatientEndpoints();
                app.MapPatientAllergyEndpoints();
                app.MapPatientMedicalHistoryEndpoints();
                app.MapDoctorEndpoints();
                app.MapDoctorAwardEndpoints();
                app.MapDoctorCertificationEndpoints();
                app.MapDoctorEducationEndpoints();
                app.MapDoctorLeaveEndpoints();
                app.MapDoctorPublicationEndpoints();
                app.MapDoctorScheduleEndpoints();
                app.MapDoctorSpecialtyEndpoints();
                app.MapDoctorWorkExperienceEndpoints();
            }
            void MapFacilityEndpoints(WebApplication app)
            {
                app.MapHospitalEndpoints();
                app.MapHospitalGroupEndpoints();
                app.MapHospitalStaffEndpoints();
                app.MapDepartmentEndpoints();
            }
            void MapClinicalEndpoints(WebApplication app)
            {
                app.MapAppointmentEndpoints();
                app.MapAppointmentTypeEndpoints();
                app.MapMedicalRecordEndpoints();
                app.MapPrescriptionEndpoints();
                app.MapPrescriptionItemEndpoints();
            }
            void MapDiagnosticEndpoints(WebApplication app)
            {
                app.MapImagingModalityEndpoints();
                app.MapImagingOrderEndpoints();
                app.MapImagingReportEndpoints();
                app.MapLabOrderEndpoints();
                app.MapLabOrderItemEndpoints();
                app.MapLabReportEndpoints();
                app.MapLabTestEndpoints();
                app.MapLabTestCategoryEndpoints();
            }
            void MapPharmacyEndpoints(WebApplication app)
            {
                app.MapMedicineEndpoints();
                app.MapMedicineCategoryEndpoints();
                app.MapMedicineInventoryEndpoints();
                app.MapManufacturerEndpoints();
                app.MapSupplierEndpoints();
            }
            void MapFinancialEndpoints(WebApplication app)
            {
                app.MapBillEndpoints();
                app.MapBillItemEndpoints();
                app.MapPaymentEndpoints();
                app.MapInsuranceCompanyEndpoints();
            }
            void MapCommonEndpoints(WebApplication app)
            {
                app.MapUserEndpoints();
                app.MapAddressEndpoints();
                app.MapProfileEndpoints();
                app.MapReviewEndpoints();
                app.MapMedicalSpecialtyEndpoints();
                app.MapRoleEndpoints();
            }

            MapCommonEndpoints(app);
            MapHealthcareEndpoints(app);
            MapFacilityEndpoints(app);
            MapClinicalEndpoints(app);
            MapDiagnosticEndpoints(app);
            MapPharmacyEndpoints(app);
            MapFinancialEndpoints(app);
            #endregion

            app.MapHealthChecks("/healthz", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapControllers();
            app.MapGrpcService<UsersApiImplementation>();

            totalTimer.Stop();

            app.Lifetime.ApplicationStarted.Register(() =>
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"Application started successfully.");
                Console.ResetColor();
                Console.WriteLine($"Total startup time: {totalTimer.ElapsedMilliseconds} ms");
                Console.WriteLine($"────────────────────────────────────────────");
            });

            app.Run();
        }

        static void LogStep(string stepName, ref System.Diagnostics.Stopwatch timer)
        {
            Console.WriteLine($"[{timer.ElapsedMilliseconds,5}ms] {stepName}");
            timer.Restart();
        }
    }
}
