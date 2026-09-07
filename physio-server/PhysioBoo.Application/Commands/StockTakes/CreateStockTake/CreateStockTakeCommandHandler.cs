
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.CreateStockTake
{
    public sealed class CreateStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<CreateStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public CreateStockTakeCommandHandler(
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

        public async Task Handle(CreateStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake stockTake = new StockTake(
                request.NewStockTake.Id,
                GenerateCode(),
                request.NewStockTake.WarehouseId,
                request.NewStockTake.DepartmentId,
                request.NewStockTake.AssignedTo,
                request.NewStockTake.ScheduledDate,
                request.NewStockTake.Notes
            );

            stockTake.SetTenantId(_user.GetTenantId());
            stockTake.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _stockTakeRepository.InsertAsync<StockTake, Guid>(stockTake);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Insert failed. Error: {result.Error}", ErrorCodes.CommitFailed));
                return;
            }

            await LogActivity(stockTake.Id, StockTakeActivityType.Created, "Stock take created.");

            if (request.NewStockTake.AssignedTo != null)
            {
                await LogActivity(stockTake.Id, StockTakeActivityType.Assigned, "Assigned to a counter.");
            }
        }

        private async Task LogActivity(Guid stockTakeId, StockTakeActivityType type, string message)
        {
            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTakeId, type, message, _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }

        private static string GenerateCode()
        {
            return $"ST-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }
    }
}
