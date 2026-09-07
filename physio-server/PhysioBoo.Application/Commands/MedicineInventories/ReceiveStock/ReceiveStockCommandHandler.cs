
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.ReceiveStock
{
    public sealed class ReceiveStockCommandHandler : CommandHandlerBase, IRequestHandler<ReceiveStockCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public ReceiveStockCommandHandler(
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

        public async Task Handle(ReceiveStockCommand request, CancellationToken ct)
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

            int quantity = request.ReceiveStock.Quantity;

            medicineInventory.SetQuantityReceived(medicineInventory.QuantityReceived + quantity);
            medicineInventory.SetQuantityAvailable(medicineInventory.QuantityAvailable + quantity);

            await _medicineInventoryRepository.UpdateTrackedAsync(medicineInventory, ct);

            StockMovement movement = new StockMovement(
                Guid.NewGuid(),
                medicineInventory.MedicineId,
                medicineInventory.Id,
                StockMovementType.Receiving,
                quantity,
                medicineInventory.WarehouseZoneId,
                _user.GetUserId(),
                reference: null,
                note: null
            );

            movement.SetTenantId(_user.GetTenantId());
            movement.SetCreatedBy(_user.GetUserId());

            await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);
        }
    }
}
