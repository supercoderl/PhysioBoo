using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AppMobiles.UploadApp
{
    public sealed class UploadAppCommandHandler : CommandHandlerBase, IRequestHandler<UploadAppCommand>
    {
        public UploadAppCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications
        ) : base(bus, unitOfWork, notifications)
        {

        }

        public async Task Handle(UploadAppCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;
        }
    }
}
