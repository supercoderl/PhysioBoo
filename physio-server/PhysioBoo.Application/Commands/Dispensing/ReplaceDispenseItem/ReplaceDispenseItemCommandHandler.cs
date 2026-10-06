using PhysioBoo.Application.Queries.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dispensing.ReplaceDispenseItem
{
    public sealed class ReplaceDispenseItemCommandHandler : CommandHandlerBase, IRequestHandler<ReplaceDispenseItemCommand>
    {
        private readonly DispenseSessionLoader _loader;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public ReplaceDispenseItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            DispenseSessionLoader loader,
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository inventoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _loader = loader;
            _medicineRepository = medicineRepository;
            _inventoryRepository = inventoryRepository;
        }

        public async Task Handle(ReplaceDispenseItemCommand request, CancellationToken ct)
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

            if (!prescriptionItem.SubtituteAllowed)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"The prescriber did not allow substitution for {prescriptionItem.MedicineName}.", DomainErrorCodes.Dispensing.SubstitutionNotAllowed));
                return;
            }

            // Alternatives are limited to medicines with the same generic name (as offered in the workspace).
            DispensingStock stock = await DispensingStock.LoadAsync(_medicineRepository, _inventoryRepository, new[] { prescriptionItem.MedicineId }, ct);
            bool offered = stock.Alternatives.GetValueOrDefault(prescriptionItem.MedicineId)?.Any(a => a.Id == request.AlternativeMedicineId) ?? false;
            if (!offered && request.AlternativeMedicineId != prescriptionItem.MedicineId)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "The selected medicine is not an in-stock equivalent of the prescribed one.", DomainErrorCodes.Dispensing.InvalidAlternative));
                return;
            }

            await _loader.ReleaseReservationAsync(item, ct);

            MedicineInventory? batch = stock.PickFefo(request.AlternativeMedicineId, item.QuantityToDispense);
            item.Replace(request.AlternativeMedicineId, batch?.Id, request.Reason.Trim());

            context.RefreshProgress();
            await CommitAsync();
        }
    }
}
