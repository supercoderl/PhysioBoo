
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.AdjustQuantity
{
    public sealed class AdjustQuantityCommandHandler : CommandHandlerBase, IRequestHandler<AdjustQuantityCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public AdjustQuantityCommandHandler(
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

        public async Task Handle(AdjustQuantityCommand request, CancellationToken ct)
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

            int oldQuantity = medicineInventory.QuantityAvailable;
            int newQuantity = request.AdjustQuantity.NewQuantity;
            int difference = newQuantity - oldQuantity;

            if (difference == 0) return;

            medicineInventory.SetQuantityAvailable(newQuantity);

            await _medicineInventoryRepository.UpdateTrackedAsync(medicineInventory, ct);

            StockMovement movement = new StockMovement(
                Guid.NewGuid(),
                medicineInventory.MedicineId,
                medicineInventory.Id,
                StockMovementType.Adjustment,
                difference,
                medicineInventory.WarehouseZoneId,
                _user.GetUserId(),
                reference: null,
                note: request.AdjustQuantity.Reason
            );

            movement.SetTenantId(_user.GetTenantId());
            movement.SetCreatedBy(_user.GetUserId());

            await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);
        }
    }
}
