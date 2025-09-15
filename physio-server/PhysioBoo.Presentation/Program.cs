
using Aikido.Zen.DotNetCore;
using HealthChecks.ApplicationStatus.DependencyInjection;
using HealthChecks.UI.Client;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using PhysioBoo.Application.Consumers;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.gRPC;
using PhysioBoo.Domain.Extensions;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Extensions;
using PhysioBoo.Presentation.Endpoints;
using PhysioBoo.Presentation.Extensions;
using PhysioBoo.ServiceDefaults;
using RabbitMQ.Client;

namespace PhysioBoo.Presentation
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

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
            builder.Services.AddSettings<MailSettings>(builder.Configuration, "Email");

            if (builder.Environment.IsProduction())
            {
                builder.Services.AddZenFirewall();
            }

            #region Handle Reference Loop - Avoid Errors When Using EF Core Navigation Properties
            builder.Services.AddControllersWithViews().AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            });
            #endregion

            var isAspire = builder.Configuration["ASPIRE_ENABLED"] == "true";
            var redisConnectionString =
                isAspire ? builder.Configuration["ConnectionStrings:Redis"] : builder.Configuration["RedisHostName"];
            var rabbitConfiguration = builder.Configuration.GetRabbitMqConfiguration();
            var dbConnectionString = isAspire
                ? builder.Configuration["ConnectionStrings:Database"]
                : builder.Configuration["ConnectionStrings:DefaultConnection"];

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
                    b => b.MigrationsAssembly("PhysioBoo.Infrastructure")
                );
            });
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

            #region Consumers
            builder.Services.AddMassTransit(x =>
            {
                x.AddConsumer<FanoutEventConsumer>();

                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.ConfigureNewtonsoftJsonSerializer(settings =>
                    {
                        settings.TypeNameHandling = TypeNameHandling.Objects;
                        settings.NullValueHandling = NullValueHandling.Ignore;
                        return settings;
                    });
                    cfg.UseNewtonsoftJsonSerializer();
                    cfg.ConfigureNewtonsoftJsonDeserializer(settings =>
                    {
                        settings.TypeNameHandling = TypeNameHandling.Objects;
                        settings.NullValueHandling = NullValueHandling.Ignore;
                        return settings;
                    });

                    cfg.Host(rabbitConfiguration.Host, (ushort)rabbitConfiguration.Port, "/", h => {
                        h.Username(rabbitConfiguration.Username);
                        h.Password(rabbitConfiguration.Password);
                    });

                    // Every instance of the service will receive the message
                    cfg.ReceiveEndpoint("physio-boo-fanout-event-" + Guid.NewGuid(), e =>
                    {
                        e.Durable = false;
                        e.AutoDelete = true;
                        e.ConfigureConsumer<FanoutEventConsumer>(context);
                        e.DiscardSkippedMessages();
                    });
                    cfg.ConfigureEndpoints(context);
                });
            });
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

            app.MapHealthChecks("/heathz", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            app.MapControllers();
            app.MapGrpcService<UsersApiImplementation>();

            app.Run();
        }
    }
}
