using MediatR;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Queries.Users.GetByEmail;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.LoginUser
{
    public sealed class LoginUserCommandHandler : CommandHandlerBase, IRequestHandler<LoginUserCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly TokenSettings _token;

        public LoginUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IOptions<TokenSettings> options
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _token = options.Value;
        }

        public async Task Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var user = await Bus.QueryAsync(new GetUserByEmailQuery(request.Email));

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User {request.Email} does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            if (!await ValidatePassword(user, request)) return;

            if(!await CheckUserStatus(user, request)) return;

            user.SetLastLoginAt(TimeZoneHelper.GetLocalTimeNow());

            var result = await _userRepository.UpdateTrackedAsync(user);

            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Cannot update user, please try again.",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await GenerateTokens(user);
        }

        /// <summary>
        /// Validates the user's password. 
        /// If incorrect, a domain notification is published, the user is locked after too many attempts, 
        /// and the method returns <c>false</c>.
        /// </summary>
        /// <param name="user">The user being validated.</param>
        /// <param name="request">The login request containing the raw password.</param>
        /// <returns><c>true</c> if the password is valid; otherwise, <c>false</c>.</returns>
        private async Task<bool> ValidatePassword(Domain.Entities.Core.User user, LoginUserCommand request)
        {
             
            if (!AuthHelper.VerifyPassword(request.Password, user.PasswordHash))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Password does not correct!",
                    "WRONG_PASSWORD"
                ));

                user.RegisterFailedLogin(Domain.Constants.MaxCounts.User.FailedLoginAttempts, 15);

                await _userRepository.UpdateTrackedAsync(user);

                return false;
            }

            return true;
        }

        /// <summary>
        /// Checks if the user is active, not locked, and verified.
        /// Publishes appropriate domain notifications if the account is banned or not verified.
        /// </summary>
        /// <param name="user">The user to check.</param>
        /// <param name="request">The login request for context.</param>
        /// <returns><c>true</c> if the user is active and verified; otherwise, <c>false</c>.</returns>
        private async Task<bool> CheckUserStatus(Domain.Entities.Core.User user, LoginUserCommand request)
        {
            if (!user.IsActive || user.AccountLockedUntil.HasValue)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Your account has been banned{(user.AccountLockedUntil.HasValue ? $" until {user.AccountLockedUntil.Value.ToString("yyyy-MM-dd HH:mm:ss")}" : ".")}",
                    "USER_HAS_BEEN_BANNED_BY_SYSTEM"
                ));

                return false;
            }

            if (!user.IsVerified || !user.EmailVerifiedAt.HasValue)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User is not verified yet.",
                    "USER_IS_NOT_VERIFIED_YET"
                ));

                await Bus.RaiseEventAsync(new UsersCreatedEvent(new List<Guid> { user.Id }));

                return false;
            }

            return true;
        }

        /// <summary>
        /// Generates an access token and refresh token for the specified user
        /// and publishes a <see cref="UserLoggedEvent"/> containing both tokens.
        /// </summary>
        /// <param name="user">The authenticated user.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        private async Task GenerateTokens(Domain.Entities.Core.User user)
        {
            var accessToken = TokenHelper.BuildToken(new Dictionary<string, string>
            {
                ["Email"] = user.Email,
                ["Role"] = user.Role.ToString(),
                ["Id"] = user.Id.ToString(),
                ["Name"] = user.Email.Split("@")[0]
            }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes);

            var refreshToken = TokenHelper.GenerateSecureToken(32);

            await Bus.RaiseEventAsync(new UserLoggedEvent(user.Id, accessToken, refreshToken));
        }
    }
}
