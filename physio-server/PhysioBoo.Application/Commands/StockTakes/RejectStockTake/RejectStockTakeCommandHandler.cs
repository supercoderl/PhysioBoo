
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.RejectStockTake
{
    public sealed class RejectStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<RejectStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public RejectStockTakeCommandHandler(
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

        public async Task Handle(RejectStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (stockTake.Status != StockTakeStatus.PendingApproval)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Only a PendingApproval stock take can be rejected.", ErrorCodes.InvalidOperation));
                return;
            }

            stockTake.Reject(request.Rejection.Reason);
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Rejected, $"Rejected: {request.Rejection.Reason}", _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
