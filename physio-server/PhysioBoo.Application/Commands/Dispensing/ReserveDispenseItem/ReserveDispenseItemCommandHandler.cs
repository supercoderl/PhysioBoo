using PhysioBoo.Application.Queries.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dispensing.ReserveDispenseItem
{
    public sealed class ReserveDispenseItemCommandHandler : CommandHandlerBase, IRequestHandler<ReserveDispenseItemCommand>
    {
        private readonly DispenseSessionLoader _loader;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public ReserveDispenseItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            DispenseSessionLoader loader,
            IMedicineInventoryRepository inventoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _loader = loader;
            _inventoryRepository = inventoryRepository;
        }

        public async Task Handle(ReserveDispenseItemCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            (DispenseContext? context, string? error, string? code) = await _loader.LoadAsync(request.PrescriptionId, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, error!, code!));
                return;
            }

            DispenseSessionItem? item = context.FindItem(request.ItemId);
            if (item == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Line {request.ItemId} is not part of this prescription.", ErrorCodes.ObjectNotFound));
                return;
            }

            MedicineInventory? batch = item.MedicineInventoryId.HasValue
                ? await _inventoryRepository.GetByIdAsync(item.MedicineInventoryId.Value, ct: ct)
                : null;

            if (batch == null || DispensingStock.IsExpired(batch) || batch.Status is BatchLifecycleStatus.Locked or BatchLifecycleStatus.Disposed)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Select an available batch before reserving.", DomainErrorCodes.Dispensing.BatchUnavailable));
                return;
            }

            int toReserve = item.QuantityToDispense - item.ReservedQuantity;
            if (toReserve <= 0)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "The full quantity for this line is already reserved.", DomainErrorCodes.Dispensing.InvalidQuantity));
                return;
            }

            if (toReserve > DispensingStock.FreeQuantity(batch))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Batch {batch.BatchNumber} only has {DispensingStock.FreeQuantity(batch)} unreserved.", DomainErrorCodes.Dispensing.InsufficientStock));
                return;
            }

            batch.Reserve(toReserve);
            item.SetReservedQuantity(item.ReservedQuantity + toReserve);
            item.SetStatus(DispenseItemStatus.Reserved);

            context.RefreshProgress();
            await CommitAsync();
        }
    }
}
