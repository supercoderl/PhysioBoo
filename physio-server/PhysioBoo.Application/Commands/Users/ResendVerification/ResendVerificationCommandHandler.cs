using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommandHandler : CommandHandlerBase, IRequestHandler<ResendVerificationCommand>
    {
        private readonly IVerificationService _verificationService;
        private readonly IUser _user;

        public ResendVerificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationService verificationService,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationService = verificationService;
            _user = user;
        }

        public async Task Handle(ResendVerificationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            await _verificationService.SendAsync(_user.GetUserId(), null, request.VerificationType, ct);
        }
    }
}
