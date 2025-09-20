using MediatR;
using Microsoft.Extensions.Options;
using PhysioBoo.Domain.Enums;
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

            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User {request.Email} does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            if (!await CheckIsLockedUser(user, request)) return;

            var validationResult = await ValidateUser(user, request);

            if (!validationResult.IsValid)
            {
                // Only update if there was a failed login attempt
                if (validationResult.UpdateUser)
                {
                    await _userRepository.UpdateUserFailedLoginAsync(user.Id, user.FailedLoginAttempts, user.AccountLockedUntil);
                }
                return;
            }

            var (accessToken, refreshToken) = TokenHelper.BuildAuthToken(
                new Dictionary<string, string>
                {
                    ["Email"] = user.Email,
                    ["Role"] = user.Role.ToString(),
                    ["Id"] = user.Id.ToString(),
                    ["Name"] = user.Email.Split("@")[0]
                }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes
            );

            var updateResult = await _userRepository.UpdateLastLoginAsync(user.Id, TimeZoneHelper.GetLocalTimeNow());

            if (!updateResult)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Cannot update user, please try again.",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            _ = Task.Run(() => Bus.RaiseEventAsync(new UserLoggedEvent(user.Id, accessToken, refreshToken)), cancellationToken);
        }

        /// <summary>
        /// Validates the user's password. 
        /// If incorrect, a domain notification is published, the user is locked after too many attempts, 
        /// and the method returns <c>false</c>.
        /// </summary>
        /// <param name="user">The user being validated.</param>
        /// <param name="request">The login request containing the raw password.</param>
        /// <returns><c>true</c> if the password is valid; otherwise, <c>false</c>.</returns>
        private async Task<(bool IsValid, bool UpdateUser)> ValidateUser(Domain.Entities.Core.User user, LoginUserCommand request)
        {
            if (!user.IsActive)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Your account has been banned.",
                    "USER_HAS_BEEN_BANNED_BY_SYSTEM"
                ));

                return (false, false);
            }

            if (!user.IsVerified || !user.EmailVerifiedAt.HasValue)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User is not verified yet.",
                    "USER_IS_NOT_VERIFIED_YET"
                ));

                await Bus.RaiseEventAsync(new UsersCreatedEvent(new List<Guid> { user.Id }, VerificationType.Email.ToString()));

                return (false, false);
            }

            if (!AuthHelper.VerifyPassword(request.Password, user.PasswordHash))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Password does not correct!",
                    "WRONG_PASSWORD"
                ));

                user.RegisterFailedLogin(Domain.Constants.MaxCounts.User.FailedLoginAttempts, 15);

                return (false, true);
            }

            return (true, false);
        }

        /// <summary>
        /// Checks if the user is locked or not.
        /// Publishes appropriate domain notifications if the account is locked.
        /// </summary>
        /// <param name="user">The user to check.</param>
        /// <param name="request">The login request for context.</param>
        /// <returns><c>true</c> if the user is not locked; otherwise, <c>false</c>.</returns>
        private async Task<bool> CheckIsLockedUser(Domain.Entities.Core.User user, LoginUserCommand request)
        {
            if (user.AccountLockedUntil.HasValue && user.AccountLockedUntil.Value > TimeZoneHelper.GetLocalTimeNow())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Your account is locked until {user.AccountLockedUntil.Value:yyyy-MM-dd HH:mm:ss}",
                    "USER_HAS_BEEN_LOCKED"
                ));

                return false;
            }

            return true;
        }
    }
}
