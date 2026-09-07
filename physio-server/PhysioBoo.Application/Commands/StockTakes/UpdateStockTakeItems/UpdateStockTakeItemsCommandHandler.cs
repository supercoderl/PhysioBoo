
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.StockTakes.UpdateStockTakeItems
{
    public sealed class UpdateStockTakeItemsCommandHandler : CommandHandlerBase, IRequestHandler<UpdateStockTakeItemsCommand>
    {
        private readonly IStockTakeItemRepository _stockTakeItemRepository;
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;
        private readonly IUser _user;

        public UpdateStockTakeItemsCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IStockTakeItemRepository stockTakeItemRepository,
            IStockTakeActivityRepository stockTakeActivityRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _stockTakeItemRepository = stockTakeItemRepository;
            _stockTakeActivityRepository = stockTakeActivityRepository;
            _user = user;
        }

        public async Task Handle(UpdateStockTakeItemsCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            List<Guid> itemIds = request.Update.Items.Select(i => i.ItemId).ToList();

            List<StockTakeItem> items = await _stockTakeItemRepository
                .GetAllNoTracking(filter: i => itemIds.Contains(i.Id) && i.StockTakeId == request.StockTakeId)
                .ToListAsync(ct);

            foreach (StockTakeItemCountInput input in request.Update.Items)
            {
                StockTakeItem? item = items.FirstOrDefault(i => i.Id == input.ItemId);
                if (item == null) continue;

                item.RecordCount(input.ActualQty, input.Reason, input.Notes);
                await _stockTakeItemRepository.UpdateTrackedAsync(item, ct);
            }

            StockTakeActivity activity = new StockTakeActivity(
                Guid.NewGuid(), request.StockTakeId, StockTakeActivityType.ItemCounted,
                $"{request.Update.Items.Count} item(s) counted.", _user.GetUserId()
            );
            activity.SetTenantId(_user.GetTenantId());
            activity.SetCreatedBy(_user.GetUserId());
            await _stockTakeActivityRepository.InsertAsync(activity);
        }
    }
}
