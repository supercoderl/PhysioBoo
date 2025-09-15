using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Application.Commands.Users.CreateUser;

namespace PhysioBoo.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddCommandHandlers(this IServiceCollection services)
        {
            // User
            services.AddScoped<IRequestHandler<CreateUserCommand>, CreateUserCommandHandler>();

            return services;
        }
    }
}
