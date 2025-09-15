using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using PhysioBoo.Domain.EventHandler;
using PhysioBoo.Domain.EventHandler.Fanout;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Domain.Extensions
{
    public static class ServiceCollectionExtension
    {
        public static IServiceCollection AddNotificationHandlers(this IServiceCollection services)
        {
            // Fanout
            services.AddScoped<IFanoutEventHandler, FanoutEventHandler>();

            // User
            services.AddScoped<INotificationHandler<UsersCreatedEvent>, UserEventHandler>();

            return services;
        }

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
