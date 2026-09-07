
using PhysioBoo.Application.Extensions;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Cashier.ApplyDiscount
{
    public sealed class ApplyDiscountCommandHandler : CommandHandlerBase, IRequestHandler<ApplyDiscountCommand>
    {
        private readonly IBillRepository _billRepository;

        public ApplyDiscountCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
        }

        public async Task Handle(ApplyDiscountCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Bill? bill = await _billRepository.GetByIdAsync(request.InvoiceId, includeProperties: "BillItems,Payments", ct: ct);

            if (bill == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {request.InvoiceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            decimal discountAmount = Math.Round(bill.Subtotal * request.Discount.DiscountPercent / 100m, 2);
            bill.RecalculateAndApply(discountAmount: discountAmount);

            await _billRepository.UpdateTrackedAsync(bill, ct);
        }
    }
}
