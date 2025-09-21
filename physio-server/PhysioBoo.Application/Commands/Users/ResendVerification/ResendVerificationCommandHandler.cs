using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandHandler : CommandHandlerBase, IRequestHandler<ResendVerificationCommand>
    {
        private readonly IVerificationService _verificationService;

        public ResendVerificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationService verificationService
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationService = verificationService;
        }

        public async Task Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            await _verificationService.SendAsync(request.UserId, null, request.VerificationType, cancellationToken);
        }
    }
}
