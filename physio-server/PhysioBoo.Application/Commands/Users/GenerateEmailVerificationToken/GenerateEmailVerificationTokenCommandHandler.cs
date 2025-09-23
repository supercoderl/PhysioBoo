using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandHandler : CommandHandlerBase, IRequestHandler<GenerateEmailVerificationTokenCommand>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public GenerateEmailVerificationTokenCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationTokenRepository verificationTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Handle(GenerateEmailVerificationTokenCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var newToken = TokenHelper.GenerateTimestampedToken(24);

            var result = await _verificationTokenRepository.InsertAsync<VerificationToken, Guid>(new VerificationToken(
                request.NewVerificationToken.Id,
                request.NewVerificationToken.UserId,
                request.NewVerificationToken.Token,
                request.NewVerificationToken.ExpiresAt,
                request.NewVerificationToken.Type
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new EmailVerificationTokenGeneratedEvent(
                request.NewVerificationToken.UserId,
                null,
                request.NewVerificationToken.Token,
                request.NewVerificationToken.ExpiresAt,
                request.NewVerificationToken.Type.ToString()
            ));
        }
    }
}
