
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.RefundTransaction
{
    // Full-transaction refund only for this first pass — the API contract's optional `lineItemIds`
    // (partial refund) is accepted but not yet acted on; every line's stock is restored today.
    // Extend to per-line partial refunds once there's a concrete need.
    public sealed class RefundTransactionCommandHandler : CommandHandlerBase, IRequestHandler<RefundTransactionCommand>
    {
        private readonly IRetailTransactionRepository _retailTransactionRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public RefundTransactionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailTransactionRepository retailTransactionRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _retailTransactionRepository = retailTransactionRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _user = user;
        }

        public async Task Handle(RefundTransactionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailTransaction? transaction = await _retailTransactionRepository.GetByIdAsync(
                request.TransactionId, includeProperties: "RetailTransactionLineItems", ct: ct);

            if (transaction == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Transaction {request.TransactionId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (transaction.Status == RetailTransactionStatus.Refunded)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Transaction already refunded.", ErrorCodes.InvalidOperation));
                return;
            }

            // Return quantity to whichever batch currently has the most available stock for that
            // medicine — the exact originating batch isn't tracked per transaction line today.
            foreach (RetailTransactionLineItem line in transaction.RetailTransactionLineItems)
            {
                MedicineInventory? batch = await _medicineInventoryRepository
                    .GetAllNoTracking(filter: b => b.MedicineId == line.MedicineId && b.Status == BatchLifecycleStatus.Active)
                    .OrderByDescending(b => b.QuantityAvailable)
                    .FirstOrDefaultAsync(ct);

                if (batch == null) continue;

                batch.SetQuantityAvailable(batch.QuantityAvailable + line.Quantity);
                batch.SetQuantitySold(Math.Max(0, batch.QuantitySold - line.Quantity));
                await _medicineInventoryRepository.UpdateTrackedAsync(batch, ct);

                StockMovement movement = new StockMovement(
                    Guid.NewGuid(),
                    line.MedicineId,
                    batch.Id,
                    StockMovementType.Return,
                    line.Quantity,
                    batch.WarehouseZoneId,
                    _user.GetUserId(),
                    reference: transaction.Id.ToString(),
                    note: request.Refund.Reason
                );
                movement.SetTenantId(_user.GetTenantId());
                movement.SetCreatedBy(_user.GetUserId());
                await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);
            }

            transaction.Refund();
            await _retailTransactionRepository.UpdateTrackedAsync(transaction, ct);
        }
    }
}
