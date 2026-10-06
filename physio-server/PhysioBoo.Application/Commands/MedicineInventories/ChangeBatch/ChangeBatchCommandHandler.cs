using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicineInventories.ChangeBatch
{
    public sealed class ChangeBatchCommandHandler : CommandHandlerBase, IRequestHandler<ChangeBatchCommand>
    {
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IWarehouseZoneRepository _warehouseZoneRepository;
        private readonly ISupplierRepository _supplierRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUser _user;

        public ChangeBatchCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineInventoryRepository inventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IWarehouseZoneRepository warehouseZoneRepository,
            ISupplierRepository supplierRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _inventoryRepository = inventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _warehouseZoneRepository = warehouseZoneRepository;
            _supplierRepository = supplierRepository;
            _unitOfWork = unitOfWork;
            _user = user;
        }

        public async Task Handle(ChangeBatchCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            MedicineInventory? batch = await _inventoryRepository.GetByIdAsync(request.BatchId, ct: ct);
            if (batch == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Batch with id {request.BatchId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (batch.Status == BatchLifecycleStatus.Disposed)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Batch {batch.BatchNumber} has been disposed.", DomainErrorCodes.InventoryBatch.InvalidState));
                return;
            }

            int free = batch.QuantityAvailable - batch.ReservedQuantity;
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            List<StockMovement> movements = new List<StockMovement>();
            MedicineInventory? splitBatch = null;

            switch (request.Action)
            {
                case InventoryBatchAction.Receive:
                {
                    int quantity = request.Quantity!.Value;

                    if (request.SupplierId.HasValue)
                    {
                        if (!await _supplierRepository.ExistsAsync(request.SupplierId.Value, ct))
                        {
                            await NotifyAsync(new DomainNotification(request.MessageType, $"Supplier with id {request.SupplierId} doesn't exist.", ErrorCodes.ObjectNotFound));
                            return;
                        }
                        batch.SetSupplierId(request.SupplierId.Value);
                    }

                    batch.SetQuantityReceived(batch.QuantityReceived + quantity);
                    batch.SetQuantityAvailable(batch.QuantityAvailable + quantity);
                    if (request.PurchasePrice.HasValue)
                    {
                        batch.SetUnitPurchasePrice(request.PurchasePrice.Value);
                        batch.SetTotalPurchaseValue((batch.TotalPurchaseValue ?? 0) + request.PurchasePrice.Value * quantity);
                    }
                    if (request.ExpiryDate.HasValue) batch.SetExpiryDate(request.ExpiryDate.Value);
                    if (batch.Status == BatchLifecycleStatus.Reserved) batch.SetStatus(BatchLifecycleStatus.Active);

                    movements.Add(Movement(batch, StockMovementType.Receiving, quantity, batch.WarehouseZoneId, null));
                    break;
                }

                case InventoryBatchAction.Transfer:
                {
                    int quantity = request.Quantity!.Value;
                    Guid toZoneId = request.ToZoneId!.Value;

                    if (!await _warehouseZoneRepository.ExistsAsync(toZoneId, ct))
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, "Destination zone doesn't exist.", DomainErrorCodes.InventoryBatch.InvalidZone));
                        return;
                    }

                    if (toZoneId == batch.WarehouseZoneId)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, "The batch is already in that zone.", DomainErrorCodes.InventoryBatch.InvalidZone));
                        return;
                    }

                    if (quantity > free)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"Only {free} unreserved units can be transferred.", DomainErrorCodes.InventoryBatch.InsufficientStock));
                        return;
                    }

                    if (quantity == batch.QuantityAvailable)
                    {
                        // Whole batch moves.
                        batch.SetWarehouseZoneId(toZoneId);
                    }
                    else
                    {
                        // Part of the batch moves: split it into a new row in the destination zone.
                        splitBatch = new MedicineInventory(
                            Guid.NewGuid(),
                            batch.MedicineId,
                            batch.HospitalId,
                            batch.BatchNumber,
                            batch.SupplierId,
                            batch.PurchaseDate,
                            batch.ExpiryDate,
                            batch.UnitPurchasePrice,
                            batch.UnitSellingPrice,
                            batch.UnitPurchasePrice * quantity,
                            batch.StorageLocation,
                            now
                        );
                        splitBatch.SetQuantityReceived(quantity);
                        splitBatch.SetQuantityAvailable(quantity);
                        splitBatch.SetMinimumStockLevel(0);
                        splitBatch.SetReorderLevel(0);
                        splitBatch.SetIsNearExpiry(batch.IsNearExpiry);
                        splitBatch.SetIsExpired(batch.IsExpired);
                        splitBatch.SetWarehouseZoneId(toZoneId);
                        splitBatch.SetStatus(BatchLifecycleStatus.Active);
                        splitBatch.SetTenantId(_user.GetTenantId());
                        splitBatch.SetCreatedBy(_user.GetUserId());

                        batch.SetQuantityAvailable(batch.QuantityAvailable - quantity);
                    }

                    movements.Add(Movement(splitBatch ?? batch, StockMovementType.Transfer, quantity, toZoneId,
                        splitBatch == null ? "Whole batch moved" : $"Split from batch row {batch.Id}"));
                    break;
                }

                case InventoryBatchAction.Adjust:
                {
                    int newQuantity = request.Quantity!.Value;
                    if (newQuantity < batch.ReservedQuantity)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"{batch.ReservedQuantity} units are reserved; the quantity can't go below that.", DomainErrorCodes.InventoryBatch.InvalidQuantity));
                        return;
                    }

                    int delta = newQuantity - batch.QuantityAvailable;
                    if (delta == 0) return;

                    batch.SetQuantityAvailable(newQuantity);
                    // Signed quantity: negative means stock was written down.
                    movements.Add(Movement(batch, StockMovementType.Adjustment, delta, batch.WarehouseZoneId, request.Reason!.Trim()));
                    break;
                }

                case InventoryBatchAction.Reserve:
                {
                    if (batch.Status is BatchLifecycleStatus.Locked or BatchLifecycleStatus.Expired)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"Batch {batch.BatchNumber} is {batch.Status} and can't be reserved.", DomainErrorCodes.InventoryBatch.InvalidState));
                        return;
                    }

                    if (request.Quantity!.Value > free)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"Only {free} units are unreserved.", DomainErrorCodes.InventoryBatch.InsufficientStock));
                        return;
                    }

                    batch.Reserve(request.Quantity.Value);
                    break;
                }

                case InventoryBatchAction.Lock:
                    batch.Lock(request.Reason!.Trim());
                    break;

                case InventoryBatchAction.Dispose:
                {
                    int quantity = request.Quantity!.Value;
                    if (quantity > free)
                    {
                        await NotifyAsync(new DomainNotification(request.MessageType, $"Only {free} unreserved units can be disposed.", DomainErrorCodes.InventoryBatch.InsufficientStock));
                        return;
                    }

                    string reason = request.Reason!.Trim();
                    if (quantity == batch.QuantityAvailable)
                    {
                        batch.SetQuantityDamaged(batch.QuantityDamaged + quantity);
                        batch.Dispose(reason);
                    }
                    else
                    {
                        batch.SetQuantityAvailable(batch.QuantityAvailable - quantity);
                        batch.SetQuantityDamaged(batch.QuantityDamaged + quantity);
                        batch.SetDisposalReason(reason);
                    }

                    movements.Add(Movement(batch, StockMovementType.Disposal, quantity, batch.WarehouseZoneId, reason));
                    break;
                }
            }

            batch.SetLastUpdated(now);
            batch.SetUpdatedBy(_user.GetUserId());

            await _unitOfWork.BeginTransactionAsync(ct);
            try
            {
                if (splitBatch != null)
                    await _inventoryRepository.InsertAsync<MedicineInventory, Guid>(splitBatch);

                foreach (StockMovement movement in movements)
                    await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);

                if (!await CommitAsync())
                {
                    await _unitOfWork.RollbackTransactionAsync(ct);
                    return;
                }

                await _unitOfWork.CommitTransactionAsync(ct);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync(ct);
                throw;
            }
        }

        private StockMovement Movement(MedicineInventory batch, StockMovementType type, int quantity, Guid? zoneId, string? note)
        {
            StockMovement movement = new StockMovement(
                Guid.NewGuid(),
                batch.MedicineId,
                batch.Id,
                type,
                quantity,
                zoneId,
                _user.GetUserId(),
                reference: batch.BatchNumber,
                note: note
            );
            movement.SetTenantId(_user.GetTenantId());
            movement.SetCreatedBy(_user.GetUserId());
            return movement;
        }
    }
}
