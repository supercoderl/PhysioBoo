
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.InventoryAlerts.AcknowledgeAlert
{
    public sealed class AcknowledgeAlertCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeAlertCommand>
    {
        private readonly IInventoryAlertRepository _inventoryAlertRepository;
        private readonly IUser _user;

        public AcknowledgeAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInventoryAlertRepository inventoryAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _inventoryAlertRepository = inventoryAlertRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeAlertCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            InventoryAlert? alert = await _inventoryAlertRepository.GetByIdAsync(request.Id);

            if (alert == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Inventory alert with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            alert.Acknowledge(_user.GetUserId());

            await _inventoryAlertRepository.UpdateTrackedAsync(alert, ct);
        }
    }
}
