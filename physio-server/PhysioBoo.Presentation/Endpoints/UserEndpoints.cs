using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.Users.AssignRoleToUser;
using PhysioBoo.Application.Commands.Users.ChangePasswordUser;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.DeleteUser;
using PhysioBoo.Application.Commands.Users.ForgotPassword;
using PhysioBoo.Application.Commands.Users.LoginUser;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Commands.Users.OAuthLoginUser;
using PhysioBoo.Application.Commands.Users.RefreshToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.ResetPassword;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Commands.Users.VerifyUser;
using PhysioBoo.Application.Queries.Users.GetAll;
using PhysioBoo.Application.Queries.Users.GetPreferences;
using PhysioBoo.Application.Queries.Users.GetProfile;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Presentation.Filters;
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
            string timeZoneId = "UTC";

            RouteGroupBuilder group = app.MapGroup("api/users")
                .WithTags("Users")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create user
            group.MapPost("/register", async (
                [FromBody] CreateUserViewModel newUser,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateUserCommand(newUser, newId));

                return Results.CreatedAtRoute(
                    "GetUserById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateUser")
            .WithSummary("Create new user")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Resend verification
            group.MapPost("/resend-verification", async (
                ResendVerificationViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new ResendVerificationCommand(request.VerificationType));

                return Results.NoContent();
            }).WithName("Resend Verification")
            .WithSummary("Resend Email Verification Token For User")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Verify email
            group.MapGet("/verify-email", async (
                string token,
                string type,
                IMediatorHandler bus,
                IOptions<ClientSettings> options,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new VerifyUserCommand(token, type, type != "PasswordReset"));

                string redirectUrl = type switch
                {
                    "Email" => $"{options.Value.BaseUrl}/auth/verification-status?result=success",
                    "PasswordReset" => $"{options.Value.BaseUrl}/auth/reset-password?token={token}",

                    // fallback
                    _ => $"{options.Value.BaseUrl}/auth/login"
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
                CancellationToken cancellationToken
            ) =>
            {
                LoginUserCommand requestCmd = new LoginUserCommand(request.Identifier, request.Password);

                await bus.SendCommandAsync(requestCmd);

                if (requestCmd.Result != null)
                {
                    AuthHelper.SetTokenCookie(response, "access_token", requestCmd.Result.AccessToken, timeZoneId, env == "Development");
                    AuthHelper.SetTokenCookie(response, "refresh_token", requestCmd.Result.RefreshToken, timeZoneId, env == "Development");

                    return Results.NoContent();
                }

                return Results.Unauthorized();
            }).WithName("Login")
            .WithSummary("Login user with email and password")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
            #endregion

            #region OAuth Login
            group.MapPost("/oauth-login", async (
                [FromBody] OAuthLoginUserViewModel request,
                IMediatorHandler bus,
                HttpResponse response,
                CancellationToken cancellationToken
            ) =>
            {
                OAuthLoginUserCommand requestCmd = new OAuthLoginUserCommand(request.Token, request.Provider);

                await bus.SendCommandAsync(requestCmd);

                if (requestCmd.Result != null)
                {
                    AuthHelper.SetTokenCookie(response, "access_token", requestCmd.Result.AccessToken, timeZoneId, env == "Development");
                    AuthHelper.SetTokenCookie(response, "refresh_token", requestCmd.Result.RefreshToken, timeZoneId, env == "Development");

                    return Results.NoContent();
                }

                return Results.Unauthorized();
            }).WithName("OAuthLogin")
            .WithSummary("Login user with oauth")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
            #endregion

            #region Logout
            group.MapPost("/refresh/logout", async (
                HttpRequest request,
                HttpResponse response,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new LogoutUserCommand());

                AuthHelper.RemoveTokenCookie(response, "access_token");
                AuthHelper.RemoveTokenCookie(response, "refresh_token");

                return Results.NoContent();
            }).WithName("Logout")
            .WithSummary("Logout current user")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
            #endregion

            #region Change password
            group.MapPatch("/change-password", async (
                [FromBody] ChangePasswordViewModel request,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                Guid? id = user.GetUserId();

                if (!id.HasValue) return Results.Unauthorized();

                await bus.SendCommandAsync(new ChangePasswordUserCommand(id.Value, request.OldPassword, request.NewPassword));

                return Results.NoContent();
            }).WithName("Change password")
            .WithSummary("Change old password to new password")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();
            #endregion

            #region Forgot password
            group.MapPost("/forgot-password", async (
                [FromBody] ForgotPasswordViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new ForgotPasswordCommand(request.Email));

                return Results.NoContent();
            }).WithName("Forgot password")
            .WithSummary("Send an url with token to user for resetting password")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
            #endregion

            #region Reset password
            group.MapPost("/reset-password", async (
                [FromBody] ResetPasswordViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new ResetPasswordCommand(request.Token, request.NewPassword));

                return Results.NoContent();
            }).WithName("Reset password")
            .WithSummary("Change old password to new password")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Refresh token
            group.MapPost("/refresh/refresh-token", async (
                HttpContext context,
                IMediatorHandler bus,
                IUser user,
                HttpResponse response,
                CancellationToken cancellationToken
            ) =>
            {
                if (!context.Request.Cookies.TryGetValue("refresh_token", out string? refreshToken) || string.IsNullOrEmpty(refreshToken))
                {
                    return Results.Unauthorized();
                }

                RefreshTokenCommand requestCmd = new RefreshTokenCommand(refreshToken);

                await bus.SendCommandAsync(requestCmd);

                if (requestCmd.Result != null)
                {
                    AuthHelper.SetTokenCookie(response, "access_token", requestCmd.Result.AccessToken, timeZoneId, env == "Development");
                    AuthHelper.SetTokenCookie(response, "refresh_token", requestCmd.Result.RefreshToken, timeZoneId, env == "Development");

                    return Results.NoContent();
                }

                return Results.Unauthorized();
            }).WithName("Refresh Token")
            .WithSummary("Refresh new token")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Users
            group.MapPost("/search", async (
                [FromBody] PagedRequest<UserFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<UserViewModel> result = await bus.QueryAsync(new GetAllUsersQuery(request));

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
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new AssignRoleToUserCommand(roleForAssigning));

                return Results.NoContent();
            }).WithName("AssignRoleToUser")
            .WithSummary("Assign Role To User")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Profile
            group.MapGet("/me", async (
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                UserProfileViewModel? result = await bus.QueryAsync(new GetUserProfileQuery());

                return Results.Ok(new ResponseMessage<UserProfileViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("Profile")
            .WithSummary("Retrieve user profile.")
            .RequireAuthorization()
            .Produces<ResponseMessage<UserProfileViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<UserProfileViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Preferences
            group.MapGet("/me/preferences", async (
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                IReadOnlyDictionary<string, string> result = await bus.QueryAsync(new GetPreferencesQuery());

                return Results.Ok(new ResponseMessage<IReadOnlyDictionary<string, string>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("UserPreferences")
            .WithSummary("Retrieve user preferences.")
            .RequireAuthorization()
            .Produces<ResponseMessage<IReadOnlyDictionary<string, string>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<IReadOnlyDictionary<string, string>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update user
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateUserViewModel user,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateUserCommand(id, user));

                return Results.NoContent();
            }).WithName("UpdateUser")
            .WithSummary("Update user")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
            #endregion

            #region Delete User
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteUserCommand(id));

                return Results.NoContent();
            }).WithName("DeleteUser")
            .WithSummary("Handles requests to delete a user by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Check is authenticated
            group.MapGet("/check-auth", (
                HttpContext context,
                CancellationToken cancellationToken
            ) =>
            {
                bool? isAuthenticated = context.User.Identity?.IsAuthenticated;

                return Results.Ok(new ResponseMessage<bool>
                {
                    Success = true,
                    Data = isAuthenticated ?? false
                });
            }).WithName("Check Is Authenticated")
            .WithSummary("Check user is authenticated or not")
            .Produces<ResponseMessage<bool>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<bool>>(StatusCodes.Status400BadRequest);
            #endregion 
        }
    }
}
