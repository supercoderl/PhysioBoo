
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTake
{
    public sealed class UpdateStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<UpdateStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;

        public UpdateStockTakeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeRepository stockTakeRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeRepository = stockTakeRepository;
        }

        public async Task Handle(UpdateStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            stockTake.SetScheduledDate(request.Update.ScheduledDate);
            stockTake.SetAssignedTo(request.Update.AssignedTo);
            stockTake.SetNotes(request.Update.Notes);

            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);
        }
    }
}
