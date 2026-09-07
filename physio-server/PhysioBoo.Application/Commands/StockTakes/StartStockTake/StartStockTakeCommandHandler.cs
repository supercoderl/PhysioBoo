
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.StartStockTake
{
    // Starting a stock take snapshots every active, non-disposed batch for the stock take's
    // hospital into StockTakeItem.SystemQty at this moment — later inventory changes elsewhere
    // don't retroactively alter what's being counted (see StockTakeItem's field comment).
    public sealed class StartStockTakeCommandHandler : CommandHandlerBase, IRequestHandler<StartStockTakeCommand>
    {
        private readonly IStockTakeRepository _stockTakeRepository;
        private readonly IStockTakeItemRepository _stockTakeItemRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;
        private readonly IUser _user;

        public StartStockTakeCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeRepository stockTakeRepository,
            IStockTakeItemRepository stockTakeItemRepository,
            IStockTakeActivityRepository stockTakeActivityRepository,
            IMedicineInventoryRepository medicineInventoryRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeRepository = stockTakeRepository;
            _stockTakeItemRepository = stockTakeItemRepository;
            _stockTakeActivityRepository = stockTakeActivityRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
            _user = user;
        }

        public async Task Handle(StartStockTakeCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(request.Id, ct: ct);

            if (stockTake == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Stock take {request.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (stockTake.Status != StockTakeStatus.Draft)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Only a Draft stock take can be started.", ErrorCodes.InvalidOperation));
                return;
            }

            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => b.HospitalId == stockTake.HospitalId && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            foreach (MedicineInventory batch in batches)
            {
                StockTakeItem item = new StockTakeItem(Guid.NewGuid(), stockTake.Id, batch.Id, batch.QuantityAvailable);
                item.SetTenantId(_user.GetTenantId());
                item.SetCreatedBy(_user.GetUserId());
                await _stockTakeItemRepository.InsertAsync(item);
            }

            stockTake.Start();
            await _stockTakeRepository.UpdateTrackedAsync(stockTake, ct);

            StockTakeActivity activity = new StockTakeActivity(Guid.NewGuid(), stockTake.Id, StockTakeActivityType.Started, $"Counting started — {batches.Count} batch(es) snapshotted.", _user.GetUserId());
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
