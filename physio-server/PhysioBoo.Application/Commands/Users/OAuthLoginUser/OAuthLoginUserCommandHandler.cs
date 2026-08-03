using Google.Apis.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.OAuthLoginUser
{
    public sealed class OAuthLoginUserCommandHandler : CommandHandlerBase, IRequestHandler<OAuthLoginUserCommand>
    {
        private readonly IUserLoginRepository _userLoginRepository;
        private readonly IUserRepository _userRepository;
        private readonly TokenSettings _token;
        private readonly GoogleSettings _google;

        public OAuthLoginUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserLoginRepository userLoginRepository,
            IUserRepository userRepository,
            IOptions<TokenSettings> tokenOptions,
            IOptions<GoogleSettings> googleOptions
        ) : base(bus, unitOfWork, notifications)
        {
            _userLoginRepository = userLoginRepository;
            _userRepository = userRepository;
            _token = tokenOptions.Value;
            _google = googleOptions.Value;
        }

        public async Task Handle(OAuthLoginUserCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            GoogleJsonWebSignature.Payload? payload = await ValidateToken(request.Token);
            User? user;

            if (payload != null)
            {
                string providerKey = payload.Subject;
                string email = payload.Email;
                string name = payload.Name;
                string picture = payload.Picture;

                UserLogin? userLogin = await _userLoginRepository.GetAllNoTracking(
                    filter: x => x.LoginProvider == request.Provider && x.ProviderKey == providerKey,
                    includeProperties: "User"
                ).FirstOrDefaultAsync(ct);

                if (userLogin != null && userLogin.User != null) user = userLogin.User;
                else
                {
                    user = await _userRepository.GetByIdentifierAsync(email);

                    if (user == null)
                    {
                        Guid newId = Guid.NewGuid();
                        user = new User(newId, email, "+000000000000", AuthHelper.HashPassword(UserConstants.Password));
                        user.SetProfilePicture(picture);
                        user.SetCreatedBy(newId);
                        await _userRepository.InsertAsync(user);
                    }

                    UserLogin newUserLogin = new UserLogin(Guid.NewGuid(), request.Provider, providerKey, name, user.Id);

                    await _userLoginRepository.InsertAsync(newUserLogin);
                }

                if (!await CheckIsLockedUser(user, request)) return;

                (bool IsValid, bool UpdateUser) validationResult = await ValidateUser(user, request);

                if (!validationResult.IsValid)
                {
                    // Only update if there was a failed login attempt
                    if (validationResult.UpdateUser)
                    {
                        await _userRepository.UpdateUserFailedLoginAsync(user.Id, user.FailedLoginAttempts, user.AccountLockedUntil);
                    }
                    return;
                }

                (string accessToken, string refreshToken) = TokenHelper.BuildAuthToken(
                    new Dictionary<string, object>
                    {
                        ["Email"] = user.Email,
                        ["Id"] = user.Id.ToString(),
                        ["Name"] = user.Email.Split("@")[0],
                        ["TenantId"] = user.TenantId.ToString()
                    }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes
                );

                request.Result = new AuthResult(accessToken, refreshToken);

                await Bus.RaiseEventAsync(new UserLoggedEvent(user.Id, accessToken, refreshToken));
            }
        }

        private async Task<GoogleJsonWebSignature.Payload?> ValidateToken(string token)
        {
            try
            {
                GoogleJsonWebSignature.ValidationSettings settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { _google.ClientID }
                };

                return await GoogleJsonWebSignature.ValidateAsync(token, settings);
            }
            catch (InvalidJwtException)
            {
                return null;
            }
        }

        /// <summary>
        /// Validates the user's password. 
        /// If incorrect, a domain notification is published, the user is locked after too many attempts, 
        /// and the method returns <c>false</c>.
        /// </summary>
        /// <param name="user">The user being validated.</param>
        /// <param name="request">The login request containing the raw password.</param>
        /// <returns><c>true</c> if the password is valid; otherwise, <c>false</c>.</returns>
        private async Task<(bool IsValid, bool UpdateUser)> ValidateUser(Domain.Entities.Core.User user, OAuthLoginUserCommand request)
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

                await Bus.RaiseEventAsync(new UsersCreatedEvent(user.Id, VerificationType.Email.ToString()));

                return (false, false);
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
        private async Task<bool> CheckIsLockedUser(Domain.Entities.Core.User user, OAuthLoginUserCommand request)
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
