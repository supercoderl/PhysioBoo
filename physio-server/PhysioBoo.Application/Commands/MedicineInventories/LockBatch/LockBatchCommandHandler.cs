
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.LockBatch
{
    public sealed class LockBatchCommandHandler : CommandHandlerBase, IRequestHandler<LockBatchCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public LockBatchCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineInventoryRepository medicineInventoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task Handle(LockBatchCommand request, CancellationToken ct)
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

            medicineInventory.Lock(request.LockBatch.Reason);

            await _medicineInventoryRepository.UpdateTrackedAsync(medicineInventory, ct);
        }
    }
}
