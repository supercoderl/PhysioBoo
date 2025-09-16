using MassTransit;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Application.Commands.Mails.SendMail;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.EventHandlers.Fanout;
using PhysioBoo.Application.EventHandlers.User;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events.Users;

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
            services.AddScoped<IRequestHandler<SendMailCommand>, SendMailCommandHandler>();
            services.AddScoped<IRequestHandler<ResendVerificationCommand>, ResendVerificationCommandHandler>();

            return services;
        }

        public static IServiceCollection AddPhysioBooConsumers(
            this IServiceCollection services,
            string rabbitMqHost,
            string username = "guest",
            string password = "guest"
        )
        {
            services.AddMassTransit(x =>
            {
                // Auto scan all consumers in current assembly
                x.AddConsumers(typeof(ServiceCollectionExtensions).Assembly);

                // Set queue name format to kebab-case standard, prefix "phyo-boo"
                x.SetEndpointNameFormatter(
                    new KebabCaseEndpointNameFormatter("physio-boo", false)
                );

                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(rabbitMqHost, "/", h =>
                    {
                        h.Username(username);
                        h.Password(password);
                    });

                    // Automatically configure all endpoints
                    cfg.ConfigureEndpoints(context);

                    cfg.ReceiveEndpoint("physio-boo-fanout-event_error", e =>
                    {
                        e.Handler<Fault>(async context =>
                        {
                            Console.WriteLine($"Error: {context.Message.Exceptions.FirstOrDefault()?.Message}");
                            await Task.CompletedTask;
                        });
                    });
                });
            });

            return services;
        }
    }
}
