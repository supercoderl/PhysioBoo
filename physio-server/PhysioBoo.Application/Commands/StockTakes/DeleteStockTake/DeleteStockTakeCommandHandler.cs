
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.DeleteStockTake
{
    public sealed class DeleteStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<DeleteStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;

        public DeleteStockTakeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeRepository stockTakeRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeRepository = stockTakeRepository;
        }

        public async Task Handle(DeleteStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            _stockTakeRepository.SoftDeleteSingle(stockTake, ct: ct);
            await CommitAsync();
        }
    }
}
