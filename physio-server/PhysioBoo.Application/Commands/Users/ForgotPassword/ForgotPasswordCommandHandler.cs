using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;
using System.Data;
using System.Text;

namespace PhysioBoo.Application.Commands.Users.ForgotPassword
{
    public sealed class ForgotPasswordCommandHandler : CommandHandlerBase, IRequestHandler<ForgotPasswordCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public ForgotPasswordCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IVerificationTokenRepository verificationTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var user = await RetriveUserData(request);

            if (user == null) return;

            var parameters = new Dictionary<string, object>
            {
                { "p_user_id", user.Id },
                { "p_type", VerificationType.PasswordReset.ToString() }
            };

            var result = await _verificationTokenRepository.ExecutePostgresFunctionAsync<VerificationToken>(
                "get_tokens_dynamic",
                parameters,
                reader =>
                {
                    var token = new Domain.Entities.Core.VerificationToken(
                        reader.GetFieldValue<Guid>("Id"),
                        reader.GetFieldValue<Guid>("UserId"),
                        reader.GetString("Token"),
                        !reader.IsDBNull("ExpiresAt") ? reader.GetDateTime("ExpiresAt") : TimeZoneHelper.GetLocalTimeNow(),
                        Enum.Parse<VerificationType>(reader.GetString("Type"))
                    );

                    token.SetIsUsed(reader.GetBoolean("IsUsed"));

                    return token;
                },
                cancellationToken
            );

            if (result.Any())
            {
                var verificationToken = result.First();
                await Bus.RaiseEventAsync(new EmailVerificationTokenGeneratedEvent(
                    null,
                    request.Email,
                    verificationToken.Token,
                    verificationToken.ExpiresAt,
                    VerificationType.PasswordReset.ToString()
                ));
            }
            else
            {
                await Bus.RaiseEventAsync(new UsersCreatedEvent(new List<Guid>
                {
                    user.Id
                }, VerificationType.PasswordReset.ToString()));
            }
        }

        private async Task<User?> RetriveUserData(ForgotPasswordCommand request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User with email {request.Email} does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return user;
        }
    }
}
