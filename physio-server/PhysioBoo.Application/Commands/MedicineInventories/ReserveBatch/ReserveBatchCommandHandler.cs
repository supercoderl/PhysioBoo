
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.ReserveBatch
{
    public sealed class ReserveBatchCommandHandler : CommandHandlerBase, IRequestHandler<ReserveBatchCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public ReserveBatchCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineInventoryRepository medicineInventoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task Handle(ReserveBatchCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            MedicineInventory? medicineInventory = await _medicineInventoryRepository.GetByIdAsync(request.Id);

            if (medicineInventory == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medicine inventory with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            try
            {
                medicineInventory.Reserve(request.ReserveBatch.Quantity);
            }
            catch (InvalidOperationException ex)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    ex.Message,
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await _medicineInventoryRepository.UpdateTrackedAsync(medicineInventory, ct);
        }
    }
}
