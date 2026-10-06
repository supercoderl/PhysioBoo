using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dispensing.ScanDispenseItem
{
    public sealed class ScanDispenseItemCommandHandler : CommandHandlerBase, IRequestHandler<ScanDispenseItemCommand>
    {
        private readonly DispenseSessionLoader _loader;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public ScanDispenseItemCommandHandler(
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

        public async Task Handle(ScanDispenseItemCommand request, CancellationToken ct)
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

            Medicine? medicine = await _medicineRepository.GetByIdAsync(item.MedicineId, ct: ct);
            MedicineInventory? batch = item.MedicineInventoryId.HasValue
                ? await _inventoryRepository.GetByIdAsync(item.MedicineInventoryId.Value, ct: ct)
                : null;

            string scanned = request.Barcode.Trim();
            string?[] accepted =
            {
                medicine?.Barcode,
                medicine?.QrCode,
                medicine?.DrugCode,
                batch?.BatchNumber,
                item.MedicineId.ToString()
            };

            request.Matched = accepted.Any(c => !string.IsNullOrWhiteSpace(c) && string.Equals(c.Trim(), scanned, StringComparison.OrdinalIgnoreCase));

            if (request.Matched && item.Status != DispenseItemStatus.Dispensed)
            {
                item.SetStatus(DispenseItemStatus.Verified);
            }

            context.RefreshProgress();
            await CommitAsync();
        }
    }
}
