using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Users.AssignRoleToUser;
using PhysioBoo.Application.Commands.Users.ChangePasswordUser;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.ForgotPassword;
using PhysioBoo.Application.Commands.Users.LoginUser;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Commands.Users.RefreshToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.ResetPassword;
using PhysioBoo.Application.Commands.Users.VerifyUser;
using PhysioBoo.Application.Queries.Users.GetAll;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            string? env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            RouteGroupBuilder group = app.MapGroup("api/users")
                .WithTags("Users")
                .WithOpenApi();

            #region Create user
            group.MapPost("/register", async (
                [FromBody] CreateUserViewModel newUser,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateUserCommand(newUser));

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

                return Results.Created($"/api/users/{newUser.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newUser.Id
                });
            }).WithName("CreateUser")
            .WithSummary("Create new user")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Resend verification
            group.MapPost("/resend-verification", async (
                ResendVerificationViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

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
            #endregion

            #region Verify email
            group.MapGet("/verify-email", async (
                string token,
                string type,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new VerifyUserCommand(token, type, type != "PasswordReset"));

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

                string redirectUrl = type switch
                {
                    "Email" => "http://localhost:4200/admin",
                    "PasswordReset" => $"http://localhost:4200/auth/reset-password?token={token}",

                    // fallback
                    _ => "http://localhost:4200/auth/login"
                };

                return Results.Redirect(redirectUrl);
            }).WithName("Verify email")
            .WithSummary("Verify email")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Login
            group.MapPost("/login", async (
                [FromBody] LoginUserViewModel request,
                IMediatorHandler bus,
                HttpResponse response,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                LoginUserCommand requestCmd = new LoginUserCommand(request.Email, request.Password);

                await bus.SendCommandAsync(requestCmd);

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

                if (requestCmd.Result != null)
                {
                    string timeZoneId = "UTC";
                    AuthHelper.SetTokenCookie(response, "access_token", requestCmd.Result.AccessToken, timeZoneId, env == "Development");
                    AuthHelper.SetTokenCookie(response, "refresh_token", requestCmd.Result.RefreshToken, timeZoneId, env == "Development");

                    return Results.Ok(new ResponseMessage<string>
                    {
                        Success = true,
                        Data = "Login successfully."
                    });
                }

                return Results.StatusCode(500);
            }).WithName("Login")
            .WithSummary("Login user with email and password")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Logout
            group.MapPost("/refresh/logout", async (
                HttpRequest request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

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
            #endregion

            #region Change password
            group.MapPost("/change-password", async (
                [FromBody] ChangePasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

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
            #endregion

            #region Forgot password
            group.MapPost("/forgot-password", async (
                [FromBody] ForgotPasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

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
            #endregion

            #region Reset password
            group.MapPost("/reset-password", async (
                [FromBody] ResetPasswordViewModel request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new ResetPasswordCommand(request.Token, request.NewPassword));

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
            #endregion

            #region Refresh token
            group.MapPost("/refresh/refresh-token", async (
                [FromBody] ResetPasswordViewModel request,
                HttpContext context,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                if (!context.Request.Cookies.TryGetValue("refresh_token", out string? refreshToken) || string.IsNullOrEmpty(refreshToken))
                {
                    return Results.Unauthorized();
                }

                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

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
            #endregion

            #region Get All Users
            group.MapPost("/search", async (
                [FromBody] PagedRequest<UserFilter> request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                PagedResult<UserViewModel> result = await bus.QueryAsync(new GetAllUsersQuery(request));

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

                return Results.Ok(new ResponseMessage<PagedResult<UserViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchUsers")
            .WithSummary("Retrieve a paginated list of users with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<UserViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<UserViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Assign Role To User
            group.MapPost("/assign-role-to-user", async (
                [FromBody] RoleForAssigningViewModel roleForAssigning,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new AssignRoleToUserCommand(roleForAssigning));

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

                return Results.Ok();
            }).WithName("AssignRoleToUser")
            .WithSummary("Assign Role To User")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Profile
            group.MapPost("/me", async (
                IUser user,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                UserViewModel? result = await bus.QueryAsync(new GetUserByIdQuery(user.GetUserId()));

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

                return Results.Ok(new ResponseMessage<UserViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("Profile")
            .WithSummary("Retrieve user profile.")
            .Produces<ResponseMessage<UserViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<UserViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
