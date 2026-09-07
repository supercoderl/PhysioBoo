
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.AssignCounter
{
    public sealed class AssignCounterCommandHandler : CommandHandlerBase, IRequestHandler<AssignCounterCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public AssignCounterCommandHandler(
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

        public async Task Handle(AssignCounterCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            stockTake.SetAssignedTo(request.Assignment.AssignedTo);
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Assigned, "Assigned to a counter.", _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
