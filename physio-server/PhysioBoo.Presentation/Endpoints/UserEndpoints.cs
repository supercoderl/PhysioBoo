using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Users.ChangePasswordUser;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.ForgotPassword;
using PhysioBoo.Application.Commands.Users.LoginUser;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Commands.Users.RefreshToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.ResetPassword;
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
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ResendVerificationCommand(user.GetUserId(), request.VerificationType));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Resend verification url successfully."
                });
            }).WithName("Resend Verification")
            .WithSummary("Resend Email Verification Token For User")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            // Verify email
            group.MapGet("/verify-email", async (
                [FromQuery] string token,
                [FromQuery] string type,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new VerifyUserCommand(token, type));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = token
                });
            }).WithName("Verify email")
            .WithSummary("Verify email")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);

            // Login
            group.MapPost("/login", async (
                [FromBody] LoginUserViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new LoginUserCommand(request.Email, request.Password));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Login successfully."
                });
            }).WithName("Login")
            .WithSummary("Login user with email and password")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);

            // Logout
            group.MapPost("/refresh/logout", async (
                HttpRequest request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new LogoutUserCommand(user.GetUserId()));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "logout successfully."
                });
            }).WithName("Logout")
            .WithSummary("Logout current user")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            // Change password
            group.MapPost("/change-password", async (
                [FromBody] ChangePasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ChangePasswordUserCommand(user.GetUserId(), request.OldPassword, request.NewPassword));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Change password successfully. Please login again"
                });
            }).WithName("Change password")
            .WithSummary("Change old password to new password")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            // Forgot password
            group.MapPost("/forgot-password", async (
                [FromBody] ForgotPasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ForgotPasswordCommand(request.Email));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "An url has been sent to your email, please check."
                });
            }).WithName("Forgot password")
            .WithSummary("Send an url with token to user for resetting password")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);

            // Reset password
            group.MapPost("/reset-password", async (
                [FromBody] ResetPasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ResetPasswordCommand(user.GetUserId(), user.GetUserEmail(), request.NewPassword));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Reset password successfully. Please login again"
                });
            }).WithName("Reset password")
            .WithSummary("Change old password to new password")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            // Refresh token
            group.MapPost("/refresh/refresh-token", async (
                [FromBody] ResetPasswordViewModel request,
                HttpContext context,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                if (!context.Request.Cookies.TryGetValue("refresh_token", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
                {
                    return Results.Unauthorized();
                }

                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new RefreshTokenCommand(refreshToken));

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

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Refresh token successfully"
                });
            }).WithName("Refresh Token")
            .WithSummary("Refresh new token")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
        }
    }
}
