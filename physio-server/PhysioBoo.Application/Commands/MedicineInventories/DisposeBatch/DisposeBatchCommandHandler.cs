
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.DisposeBatch
{
    public sealed class DisposeBatchCommandHandler : CommandHandlerBase, IRequestHandler<DisposeBatchCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public DisposeBatchCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _user = user;
        }

        public async Task Handle(DisposeBatchCommand request, CancellationToken ct)
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

            // Capture the quantity BEFORE calling Dispose() — Dispose() zeroes QuantityAvailable,
            // so this is the only chance to know how much was actually removed.
            int disposedQuantity = medicineInventory.QuantityAvailable;

            medicineInventory.Dispose(request.DisposeBatch.Reason);

            await _medicineInventoryRepository.UpdateTrackedAsync(medicineInventory, ct);

            if (disposedQuantity > 0)
            {
                StockMovement movement = new StockMovement(
                    Guid.NewGuid(),
                    medicineInventory.MedicineId,
                    medicineInventory.Id,
                    StockMovementType.Disposal,
                    -disposedQuantity,
                    medicineInventory.WarehouseZoneId,
                    _user.GetUserId(),
                    reference: null,
                    note: request.DisposeBatch.Reason
                );

                movement.SetTenantId(_user.GetTenantId());
                movement.SetCreatedBy(_user.GetUserId());

                await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);
            }
        }
    }
}
