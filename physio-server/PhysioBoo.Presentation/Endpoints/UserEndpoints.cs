using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.VerifyUser;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/users")
                .WithTags("Users")
                .WithOpenApi();

            // Create user
            group.MapPost("/", async (
                CreateUserViewModel newUser,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateUserCommand(new List<CreateUserViewModel>
                {
                    newUser
                }));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<List<Guid>>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

                return Results.Created($"/api/users/{newUser.Id}", new ResponseMessage<List<Guid>>
                {
                    Success = true,
                    Data = new List<Guid> { newUser.Id }
                });
            }).WithName("CreateUser")
            .WithSummary("Create new user")
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status400BadRequest);

            // Resend verification
            group.MapPost("/resend-verification", async (
                ResendVerificationViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ResendVerificationCommand(request.UserId));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

                return Results.Created($"/api/users/resend-verrification/{request.UserId}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = request.UserId
                });
            }).WithName("Resend Verification")
            .WithSummary("Resend Email Verification Token For User")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);

            // Verify email
            group.MapGet("/verify-email", async (
                [FromQuery] string token,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new VerifyUserCommand(token));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<string>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

                return Results.Created($"/api/users/verify-email?token={token}", new ResponseMessage<string>
                {
                    Success = true,
                    Data = token
                });
            }).WithName("Verify email")
            .WithSummary("Verify email")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
        }
    }
}
