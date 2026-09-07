
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Cashier.VoidInvoice
{
    public sealed class VoidInvoiceCommandHandler : CommandHandlerBase, IRequestHandler<VoidInvoiceCommand>
    {
        private readonly IBillRepository _billRepository;

        public VoidInvoiceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
        }

        public async Task Handle(VoidInvoiceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Bill? bill = await _billRepository.GetByIdAsync(request.InvoiceId, ct: ct);

            if (bill == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {request.InvoiceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            bill.SetPaymentStatus(PaymentStatus.Cancelled);
            bill.SetNotes(string.IsNullOrWhiteSpace(bill.Notes) ? $"Voided: {request.Void.Reason}" : $"{bill.Notes}\nVoided: {request.Void.Reason}");

            await _billRepository.UpdateTrackedAsync(bill, ct);
        }
    }
}
