using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dispensing.UpdateDispenseItem
{
    public sealed class UpdateDispenseItemCommandHandler : CommandHandlerBase, IRequestHandler<UpdateDispenseItemCommand>
    {
        private readonly DispenseSessionLoader _loader;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public UpdateDispenseItemCommandHandler(
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

        public async Task Handle(UpdateDispenseItemCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            (DispenseContext? context, string? error, string? code) = await _loader.LoadAsync(request.PrescriptionId, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, error!, code!));
                return;
            }

            DispenseSessionItem? item = context.FindItem(request.ItemId);
            PrescriptionItem? prescriptionItem = context.FindPrescriptionItem(request.ItemId);
            if (item == null || prescriptionItem == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Line {request.ItemId} is not part of this prescription.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (request.QtyToDispense.HasValue)
            {
                int remaining = context.Remaining(request.ItemId);
                if (request.QtyToDispense.Value > remaining)
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, $"Only {remaining} {prescriptionItem.Unit} remain to be dispensed on this line.", DomainErrorCodes.Dispensing.InvalidQuantity));
                    return;
                }

                item.SetQuantityToDispense(request.QtyToDispense.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.BatchNo))
            {
                string batchNo = request.BatchNo.Trim();
                MedicineInventory? batch = await _inventoryRepository
                    .GetAllNoTracking(b => b.MedicineId == item.MedicineId && b.BatchNumber == batchNo)
                    .FirstOrDefaultAsync(ct);

                if (batch == null || (batch.Id != item.MedicineInventoryId && !DispensingStock.IsUsable(batch)))
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, $"Batch {batchNo} is not available for this medicine.", DomainErrorCodes.Dispensing.BatchUnavailable));
                    return;
                }

                if (batch.Id != item.MedicineInventoryId)
                {
                    await _loader.ReleaseReservationAsync(item, ct);
                    if (item.Status == DispenseItemStatus.Reserved) item.SetStatus(DispenseItemStatus.NotPicked);
                    item.SelectBatch(batch.Id);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                DispenseItemStatus status = Enum.Parse<DispenseItemStatus>(request.Status, true);

                if (status == DispenseItemStatus.Picked
                    && prescriptionItem.PrescriptionClinicalWarnings.Any(w => w.Severity == Severity.Critical && w.AcknowledgedAt == null))
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, "Acknowledge the Critical clinical alert on this line before picking it.", DomainErrorCodes.Dispensing.UnacknowledgedCritical));
                    return;
                }

                // A barcode-verified line stays verified when it is re-ticked as picked.
                if (!(status == DispenseItemStatus.Picked && item.Status == DispenseItemStatus.Verified))
                    item.SetStatus(status);
            }

            context.RefreshProgress();
            await CommitAsync();
        }
    }
}
