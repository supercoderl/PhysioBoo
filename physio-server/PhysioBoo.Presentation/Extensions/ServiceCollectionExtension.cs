using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Presentation.Swagger;
using System.Text;

namespace PhysioBoo.Presentation.Extensions
{
    public static class ServiceCollectionExtension
    {
        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.EnableAnnotations();

                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "CleanArchitecture",
                    Version = "v1",
                    Description = "A clean architecture API"
                });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. " +
                                  "Use the /api/v1/user/login endpoint to generate a token",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer"
                });

                c.ParameterFilter<SortableFieldsAttributeFilter>();

                c.SupportNonNullableReferenceTypes();

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
            });
            return services;
        }

        // CSRF Protection
        public static IServiceCollection AddCSRFProtection(this IServiceCollection services, IWebHostEnvironment env)
        {
            services.AddAntiforgery(options =>
            {
                options.HeaderName = "X-XSRF-TOKEN";
                options.Cookie.Name = "XSRF-TOKEN";

                options.Cookie.HttpOnly = true;

                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.None;
            });

            return services;
        }

        public static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpContextAccessor();

            services.AddAuthentication(
                    options => { options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; })
                .AddJwtBearer(
                    jwtOptions =>
                    {
                        jwtOptions.TokenValidationParameters = CreateTokenValidationParameters(configuration);
                        jwtOptions.Events = CreateBearerEvents(configuration);
                    });

            services
                .AddOptions<TokenSettings>()
                .Bind(configuration.GetSection("Auth"))
                .ValidateOnStart();

            return services;
        }

        public static TokenValidationParameters CreateTokenValidationParameters(IConfiguration configuration)
        {
            var result = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Auth:Issuer"],
                ValidAudience = configuration["Auth:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        configuration["Auth:Secret"]!)),
                RequireSignedTokens = false
            };

            return result;
        }

        public static JwtBearerEvents CreateBearerEvents(IConfiguration configuration)
        {
            var result = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    // Try to get token from cookie first
                    if (context.Request.Cookies.ContainsKey("access_token"))
                    {
                        context.Token = context.Request.Cookies["access_token"];
                    }
                    return Task.CompletedTask;
                }
            };

            return result;
        }
    }
}
