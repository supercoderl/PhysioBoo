
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

using PhysioBoo.Domain.Interfaces.Repositories;


namespace PhysioBoo.Application.Commands.RetailCarts.CheckoutCart
{
    public sealed class CheckoutCartCommandHandler : CommandHandlerBase, IRequestHandler<CheckoutCartCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRetailCartRepository _retailCartRepository;
        private readonly IRetailTransactionRepository _retailTransactionRepository;
        private readonly IRetailTransactionLineItemRepository _retailTransactionLineItemRepository;
        private readonly IRetailPaymentSplitRepository _retailPaymentSplitRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUser _user;

        public CheckoutCartCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository,
            IRetailTransactionRepository retailTransactionRepository,
            IRetailTransactionLineItemRepository retailTransactionLineItemRepository,
            IRetailPaymentSplitRepository retailPaymentSplitRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _unitOfWork = unitOfWork;
            _retailCartRepository = retailCartRepository;
            _retailTransactionRepository = retailTransactionRepository;
            _retailTransactionLineItemRepository = retailTransactionLineItemRepository;
            _retailPaymentSplitRepository = retailPaymentSplitRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _user = user;
        }

        public async Task Handle(CheckoutCartCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            await _unitOfWork.BeginTransactionAsync(ct);

            RetailCart? cart = await _retailCartRepository.GetByIdAsync(request.CartId, includeProperties: "RetailCartLineItems.Medicine", ct: ct);

            if (cart == null || cart.RetailCartLineItems.Count == 0)
            {
                await _unitOfWork.RollbackTransactionAsync(ct);
                await NotifyAsync(new DomainNotification(request.MessageType, "Cart not found or empty.", ErrorCodes.ObjectNotFound));
                return;
            }

            foreach (RetailCartLineItem line in cart.RetailCartLineItems)
            {
                int remaining = line.Quantity;

                List<MedicineInventory> batches = await _medicineInventoryRepository
                    .GetAllNoTracking(filter: b => b.MedicineId == line.MedicineId
                        && b.Status == BatchLifecycleStatus.Active
                        && b.QuantityAvailable > 0)
                    .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                    .ToListAsync(ct);

                if (batches.Sum(b => b.QuantityAvailable) < remaining)
                {
                    await _unitOfWork.RollbackTransactionAsync(ct);
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Insufficient stock for medicine {line.Medicine?.Name ?? line.MedicineId.ToString()}.",
                        ErrorCodes.ObjectNotFound
                    ));
                    return;
                }

                foreach (MedicineInventory batch in batches)
                {
                    if (remaining <= 0) break;

                    int take = Math.Min(remaining, batch.QuantityAvailable);
                    batch.SetQuantityAvailable(batch.QuantityAvailable - take);
                    batch.SetQuantitySold(batch.QuantitySold + take);
                    await _medicineInventoryRepository.UpdateTrackedAsync(batch, ct);

                    StockMovement movement = new StockMovement(
                        Guid.NewGuid(),
                        line.MedicineId,
                        batch.Id,
                        StockMovementType.RetailSale,
                        take,
                        batch.WarehouseZoneId,
                        _user.GetUserId(),
                        reference: request.Checkout.TransactionId.ToString(),
                        note: null
                    );
                    movement.SetTenantId(_user.GetTenantId());
                    movement.SetCreatedBy(_user.GetUserId());
                    await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);

                    remaining -= take;
                }
            }

            decimal subtotal = cart.RetailCartLineItems.Sum(i => i.UnitPrice * i.Quantity);
            decimal discountTotal = cart.RetailCartLineItems.Sum(i => i.UnitPrice * i.Quantity * i.DiscountPercent / 100m);
            decimal insuranceCoverage = cart.RetailCartLineItems.Sum(i => i.InsuranceCoveredAmount);
            decimal vat = 0;
            decimal grandTotal = subtotal - discountTotal - insuranceCoverage + vat;

            RetailTransaction transaction = new RetailTransaction(
                request.Checkout.TransactionId,
                GenerateTransactionNumber(),
                _user.GetUserId(),
                request.Checkout.HospitalId,
                cart.CustomerType,
                cart.CustomerPatientId,
                cart.CustomerFullName,
                cart.CustomerPhone,
                cart.CustomerMrn,
                cart.CustomerInsuranceProvider,
                subtotal,
                discountTotal,
                insuranceCoverage,
                vat,
                grandTotal,
                request.Checkout.AmountTendered
            );
            transaction.SetTenantId(_user.GetTenantId());
            transaction.SetCreatedBy(_user.GetUserId());

            await _retailTransactionRepository.InsertAsync<RetailTransaction, Guid>(transaction);

            foreach (RetailCartLineItem line in cart.RetailCartLineItems)
            {
                RetailTransactionLineItem txnLine = new RetailTransactionLineItem(
                    Guid.NewGuid(),
                    transaction.Id,
                    line.MedicineId,
                    line.Medicine?.Name ?? string.Empty,
                    line.Quantity,
                    line.UnitPrice,
                    line.DiscountPercent,
                    line.InsuranceCoveredAmount
                );
                txnLine.SetTenantId(_user.GetTenantId());
                txnLine.SetCreatedBy(_user.GetUserId());
                await _retailTransactionLineItemRepository.InsertAsync(txnLine);
            }

            foreach (Application.ViewModels.Retail.CheckoutPaymentSplitInput split in request.Checkout.PaymentSplits)
            {
                RetailPaymentSplit paymentSplit = new RetailPaymentSplit(
                    Guid.NewGuid(),
                    transaction.Id,
                    Enum.Parse<RetailPaymentMethod>(split.Method),
                    split.Amount
                );
                paymentSplit.SetTenantId(_user.GetTenantId());
                paymentSplit.SetCreatedBy(_user.GetUserId());
                await _retailPaymentSplitRepository.InsertAsync(paymentSplit);
            }

            _retailCartRepository.SoftDeleteSingle(cart, ct: ct);

            await _unitOfWork.CommitTransactionAsync(ct);
        }

        private static string GenerateTransactionNumber()
        {
            return $"RX-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }
    }
}
