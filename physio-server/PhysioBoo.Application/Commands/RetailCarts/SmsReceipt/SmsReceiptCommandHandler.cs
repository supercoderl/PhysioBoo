
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.SmsReceipt
{
    // Same placeholder scope as EmailReceiptCommandHandler — no SMS gateway is wired up yet.
    public sealed class SmsReceiptCommandHandler : CommandHandlerBase, IRequestHandler<SmsReceiptCommand>
    {
        private readonly IRetailTransactionRepository _retailTransactionRepository;

        public SmsReceiptCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailTransactionRepository retailTransactionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailTransactionRepository = retailTransactionRepository;
        }

        public async Task Handle(SmsReceiptCommand request, CancellationToken ct)
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
