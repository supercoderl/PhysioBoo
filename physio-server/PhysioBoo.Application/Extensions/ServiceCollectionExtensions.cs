using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.EventHandlers.Fanout;
using PhysioBoo.Application.EventHandlers.User;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKenel.ViewModels;

namespace PhysioBoo.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddNotificationHandlers(this IServiceCollection services)
        {
            // Fanout
            services.AddScoped<IFanoutEventHandler, FanoutEventHandler>();

            // User
            services.AddScoped<INotificationHandler<UsersCreatedEvent>, UserCacheEventHandler>();
            services.AddScoped<INotificationHandler<UsersCreatedEvent>, UserEmailVerificationEventHandler>();
            services.AddScoped<INotificationHandler<EmailVerificationRequiredEvent>, EmailVerificationRequiredEventHandler>();
            services.AddScoped<INotificationHandler<EmailVerificationTokenGeneratedEvent>, EmailVerificationTokenEmailHandler>();

            return services;
        }

        public static IServiceCollection AddQueryHandlers(this IServiceCollection services)
        {
            // User
            services.AddScoped<IRequestHandler<GetUserByIdQuery, UserViewModel?>, GetUserByIdQueryHandler>();

            return services;
        }

        public static IServiceCollection AddCommandHandlers(this IServiceCollection services)
        {
            // User
            services.AddScoped<IRequestHandler<CreateUserCommand>, CreateUserCommandHandler>();
            services.AddScoped<IRequestHandler<GenerateEmailVerificationTokenCommand>, GenerateEmailVerificationTokenCommandHandler>();

            return services;
        }
    }
}
