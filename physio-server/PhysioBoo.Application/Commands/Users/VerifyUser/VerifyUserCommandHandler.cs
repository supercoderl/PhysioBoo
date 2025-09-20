using MediatR;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.VerifyUser
{
    public sealed class VerifyUserCommandHandler : CommandHandlerBase, IRequestHandler<VerifyUserCommand>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public VerifyUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationTokenRepository verificationTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Handle(VerifyUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _verificationTokenRepository.BatchUpdateAsync(
                predicate: p => p.Token == request.Token && !p.IsUsed && p.ExpiresAt > TimeZoneHelper.GetLocalTimeNow(),
                updateDto: new { IsUsed = true },
                cancellationToken
            );

            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Token does not exists. Please check again your url.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            await Bus.RaiseEventAsync(new UserVerifiedEvent(request.Token, request.Type));
        }
    }
}
