
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.CompleteStockTake
{
    // "Complete" here means counting is finished and the session moves to PendingApproval — it does
    // NOT reconcile inventory yet. Reconciliation happens on Approve (see ApproveStockTakeCommandHandler).
    public sealed class CompleteStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<CompleteStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public CompleteStockTakeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeRepository stockTakeRepository,
            IStockTakeActivityRepository stockTakeActivityRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeRepository = stockTakeRepository;
            _stockTakeActivityRepository = stockTakeActivityRepository;
            _user = user;
        }

        public async Task Handle(CompleteStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, includeProperties: "StockTakeItems", ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (stockTake.Status != StockTakeStatus.Counting)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Only a Counting stock take can be completed.", ErrorCodes.InvalidOperation));
                return;
            }

            if (stockTake.StockTakeItems.Any(i => !i.IsCounted))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "All items must be counted before completing.", ErrorCodes.InvalidOperation));
                return;
            }

            stockTake.SubmitForApproval();
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Completed, "Counting completed — pending approval.", _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
