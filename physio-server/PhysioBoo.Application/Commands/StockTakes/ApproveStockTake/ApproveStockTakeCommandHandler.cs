
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.ApproveStockTake
{
    // The reconciliation step: for every counted item whose ActualQty differs from SystemQty, write
    // a StockMovement (Type = Adjustment) and bring MedicineInventory.QuantityAvailable in line with
    // what was actually counted. This is the actual link between Stock Take and Inventory that
    // wasn't specified explicitly anywhere before this pass (see stock-take-redesign.md §17.0).
    public sealed class ApproveStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<ApproveStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public ApproveStockTakeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeRepository stockTakeRepository,
            IStockTakeActivityRepository stockTakeActivityRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeRepository = stockTakeRepository;
            _stockTakeActivityRepository = stockTakeActivityRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _user = user;
        }

        public async Task Handle(ApproveStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, includeProperties: "StockTakeItems.MedicineInventory", ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (stockTake.Status != StockTakeStatus.PendingApproval)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Only a PendingApproval stock take can be approved.", ErrorCodes.InvalidOperation));
                return;
            }

            int adjustedCount = 0;

            foreach (StockTakeItem item in stockTake.StockTakeItems)
            {
                int difference = item.Difference();
                if (difference == 0 || item.MedicineInventory == null) continue;

                MedicineInventory batch = item.MedicineInventory;
                batch.SetQuantityAvailable(Math.Max(0, batch.QuantityAvailable + difference));
                await _medicineInventoryRepository.UpdateTrackedAsync(batch, ct);

                StockMovement movement = new StockMovement(
                    Guid.NewGuid(),
                    batch.MedicineId,
                    batch.Id,
                    StockMovementType.Adjustment,
                    difference,
                    batch.WarehouseZoneId,
                    _user.GetUserId(),
                    reference: stockTake.Code,
                    note: $"Stock take {stockTake.Code} reconciliation ({(item.Reason ?? "unspecified reason")})"
                );
                movement.SetTenantId(_user.GetTenantId());
                movement.SetCreatedBy(_user.GetUserId());
                await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);

                adjustedCount++;
            }

            stockTake.Approve();
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(
                Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Approved,
                $"Approved — {adjustedCount} batch(es) reconciled." + (string.IsNullOrWhiteSpace(request.Approval.Note) ? "" : $" Note: {request.Approval.Note}"),
                _user.GetUserId()
            );
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
