using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Media.UploadFile
{
    public sealed class UploadFileCommandHandler : CommandHandlerBase, IRequestHandler<UploadFileCommand>
    {
        public UploadFileCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications
        ) : base(bus, unitOfWork, notifications)
        {

        }

        public async Task Handle(UploadFileCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;


        }
    }
}
