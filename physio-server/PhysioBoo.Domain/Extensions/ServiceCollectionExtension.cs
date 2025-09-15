using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using PhysioBoo.Domain.Interfaces;

namespace PhysioBoo.Domain.Extensions
{
    public static class ServiceCollectionExtension
    {
        public static IServiceCollection AddApiUser(this IServiceCollection services)
        {
            // User
            services.AddScoped<IUser, ApiUser>();

            return services;
        }

        public static OptionsBuilder<T> AddSettings<T>(this IServiceCollection services, IConfiguration configuration, string sectionName)
            where T : class
        {
            return services
                .AddOptions<T>()
                .Bind(configuration.GetSection(sectionName))
                .ValidateOnStart();
        }
    }
}
