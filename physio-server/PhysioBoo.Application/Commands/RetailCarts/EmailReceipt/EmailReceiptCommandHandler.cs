
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.EmailReceipt
{
    // Only validates the transaction exists and queues nothing further — no email-sending
    // infrastructure is wired to Retail receipts yet. Extend once a notification/email service
    // is available to call from here (see existing patterns under Consumers/Users for the queue
    // this codebase already uses for outbound email).
    public sealed class EmailReceiptCommandHandler : CommandHandlerBase, IRequestHandler<EmailReceiptCommand>
    {
        private readonly IRetailTransactionRepository _retailTransactionRepository;

        public EmailReceiptCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailTransactionRepository retailTransactionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailTransactionRepository = retailTransactionRepository;
        }

        public async Task Handle(EmailReceiptCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            bool exists = await _retailTransactionRepository.ExistsAsync(request.TransactionId, ct);

            if (!exists)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Transaction {request.TransactionId} not found.", ErrorCodes.ObjectNotFound));
            }
        }
    }
}
