
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
using RabbitMQ.Client;
using StackExchange.Profiling.Storage;

namespace PhysioBoo.Presentation
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var isAspire = builder.Configuration["ASPIRE_ENABLED"] == "true";
            var redisConnectionString =
                isAspire ? builder.Configuration["ConnectionStrings:Redis"] : builder.Configuration["RedisHostName"];
            var rabbitConfiguration = builder.Configuration.GetRabbitMqConfiguration();
            var dbConnectionString = isAspire
                ? builder.Configuration["ConnectionStrings:Database"]
                : builder.Configuration["ConnectionStrings:DefaultConnection"];

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwagger();
            builder.Services.AddInfrastructure(builder.Configuration, "PhysioBoo.Infrastructure");
            builder.Services.AddNotificationHandlers();
            builder.Services.AddApiUser();
            builder.Services.AddCommandHandlers();
            builder.Services.AddAuth(builder.Configuration);
            builder.Services.AddGrpc();
            builder.Services.AddGrpcReflection();
            builder.Services.AddOpenApi();
            builder.Services.AddQueryHandlers();
            builder.Services.AddPhysioBooConsumers(rabbitConfiguration.Host, rabbitConfiguration.Username, rabbitConfiguration.Password);
            builder.Services.AddSettings<MailSettings>(builder.Configuration, "Email");
            builder.Services.AddSettings<ServerSettings>(builder.Configuration, "Server");
            builder.Services.AddHostedService<WarmupConnection>();
            builder.Services.AddCSRFProtection(builder.Environment);
            builder.Services.AddEmail();
            builder.Services.AddServices();

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

            #region Rabbit MQ Config
            if (builder.Environment.IsProduction())
            {
                builder.Services
                    .AddHealthChecks()
                    .AddDbContextCheck<ApplicationDbContext>()
                    .AddApplicationStatus()
                    .AddNpgSql(dbConnectionString!)
                    .AddRedis(redisConnectionString!, "Redis")
                    .AddRabbitMQ(async _ =>
                    {
                        var factory = new ConnectionFactory
                        {
                            Uri = new Uri(rabbitConfiguration.ConnectionString)
                        };

                        return await factory.CreateConnectionAsync();
                    }, name: "RabbitMQ");
            }
            #endregion

            #region DbContext
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseLazyLoadingProxies();
                options.UseNpgsql(dbConnectionString,
                    npgsqlOptions => npgsqlOptions
                            .MigrationsAssembly("PhysioBoo.Infrastructure")
                            .CommandTimeout(30)
                            // Enable connection pooling
                            .EnableRetryOnFailure(3)
                );
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
                options.LogTo(Console.WriteLine, LogLevel.Information);
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
                cfg.RegisterServicesFromAssemblies(typeof(Program).Assembly);
            });
            #endregion

            #region Logging
            builder.Services.AddLogging(x => x.AddSimpleConsole(console =>
            {
                console.TimestampFormat = "[yyyy-MM-ddTHH:mm:ss.fff]";
                console.IncludeScopes = true;
            }));
            #endregion

            #region Mini Profiler
            builder.Services.AddMemoryCache();
            builder.Services.AddMiniProfiler(options =>
            {
                options.RouteBasePath = "/profiler";
                options.Storage = new MemoryCacheStorage(
                    new MemoryCache(new MemoryCacheOptions()), // IMemoryCache
                    TimeSpan.FromMinutes(60)
                );
                options.TrackConnectionOpenClose = true;
            }).AddEntityFramework();
            #endregion

            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            var app = builder.Build();

            app.MapDefaultEndpoints();

            // Sync with newest migration
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var appDbContext = services.GetRequiredService<ApplicationDbContext>();
                var storeDbContext = services.GetRequiredService<EventStoreDbContext>();
                var domainStoreDbContext = services.GetRequiredService<DomainNotificationStoreDbContext>();

                appDbContext.EnsureMigrationsApplied();
                storeDbContext.EnsureMigrationsApplied();
                domainStoreDbContext.EnsureMigrationsApplied();
            }

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

            // Map endpoints
            app.MapUserEndpoints();
            app.MapPatientEndpoints();
            app.MapDoctorEndpoints();
            app.MapHospitalEndpoints();
            app.MapHospitalGroupEndpoints();
            app.MapAddressEndpoints();

            app.MapHealthChecks("/healthz", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapControllers();
            app.MapGrpcService<UsersApiImplementation>();

            app.Run();
        }
    }
}
