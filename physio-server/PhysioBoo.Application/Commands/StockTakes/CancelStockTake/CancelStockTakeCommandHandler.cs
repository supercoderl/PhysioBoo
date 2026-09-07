
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.CancelStockTake
{
    public sealed class CancelStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<CancelStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public CancelStockTakeCommandHandler(
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

        public async Task Handle(CancelStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (stockTake.Status is StockTakeStatus.Approved or StockTakeStatus.Cancelled)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"A {stockTake.Status} stock take cannot be cancelled.", ErrorCodes.InvalidOperation));
                return;
            }

            stockTake.Cancel();
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Cancelled, "Stock take cancelled.", _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
