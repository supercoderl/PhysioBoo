using PhysioBoo.Application.Queries.Dispensing;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace PhysioBoo.Application.Commands.Dispensing.CompleteDispensing
{
    /// <summary>
    /// Deducts stock for every ready line (Picked / Verified / Replaced), records Dispense stock
    /// movements, updates dispensed quantities and moves the prescription to Dispensed or
    /// PartiallyDispensed — all in one transaction. Reserved lines keep their reservation.
    /// </summary>
    public sealed class CompleteDispensingCommandHandler : CommandHandlerBase, IRequestHandler<CompleteDispensingCommand>
    {
        private readonly DispenseSessionLoader _loader;
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUser _user;

        public CompleteDispensingCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            DispenseSessionLoader loader,
            IMedicineInventoryRepository inventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _loader = loader;
            _inventoryRepository = inventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _unitOfWork = unitOfWork;
            _user = user;
        }

        public async Task Handle(CompleteDispensingCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            (DispenseContext? context, string? error, string? code) = await _loader.LoadAsync(request.PrescriptionId, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, error!, code!));
                return;
            }

            Prescription prescription = context.Prescription;
            DispenseSession session = context.Session;

            if (DispensingMapper.HasUnacknowledgedCritical(prescription))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Acknowledge all Critical clinical alerts before completing.", DomainErrorCodes.Dispensing.UnacknowledgedCritical));
                return;
            }

            if (session.Items.Any(i => i.Status == DispenseItemStatus.NotPicked && context.Remaining(i.PrescriptionItemId) > 0))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Pick or resolve every medication line before completing.", DomainErrorCodes.Dispensing.LinesNotPicked));
                return;
            }

            List<DispenseSessionItem> ready = session.Items.Where(i => i.IsReadyToDispense).ToList();
            List<Guid> batchIds = ready.Where(i => i.MedicineInventoryId.HasValue).Select(i => i.MedicineInventoryId!.Value).Distinct().ToList();
            List<Guid> unbatchedMedicineIds = ready.Where(i => !i.MedicineInventoryId.HasValue).Select(i => i.MedicineId).Distinct().ToList();

            // Tracked batches: the ones already chosen, plus FEFO candidates for lines without a batch.
            List<MedicineInventory> batches = await _inventoryRepository
                .GetAll(b => batchIds.Contains(b.Id) || unbatchedMedicineIds.Contains(b.MedicineId))
                .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                .ToListAsync(ct);

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            int movements = 0;
            decimal insuranceCoverage = 0;
            decimal patientPayment = 0;

            await _unitOfWork.BeginTransactionAsync(ct);
            try
            {
                foreach (DispenseSessionItem item in ready)
                {
                    PrescriptionItem prescriptionItem = context.FindPrescriptionItem(item.PrescriptionItemId)!;
                    int quantity = Math.Min(item.QuantityToDispense, context.Remaining(item.PrescriptionItemId));
                    if (quantity <= 0) continue;

                    MedicineInventory? batch = item.MedicineInventoryId.HasValue
                        ? batches.FirstOrDefault(b => b.Id == item.MedicineInventoryId.Value)
                        : batches.FirstOrDefault(b => b.MedicineId == item.MedicineId && DispensingStock.IsUsable(b) && DispensingStock.FreeQuantity(b) >= quantity);

                    // Stock this line may take: everything not reserved by someone else.
                    int takeable = batch == null ? 0 : batch.QuantityAvailable - (batch.ReservedQuantity - item.ReservedQuantity);
                    if (batch == null || DispensingStock.IsExpired(batch) || batch.Status is BatchLifecycleStatus.Locked or BatchLifecycleStatus.Disposed || takeable < quantity)
                    {
                        await _unitOfWork.RollbackTransactionAsync(ct);
                        await NotifyAsync(new DomainNotification(
                            request.MessageType,
                            $"Not enough usable stock in {(batch?.BatchNumber != null ? $"batch {batch.BatchNumber}" : "any batch")} for {prescriptionItem.MedicineName} (needs {quantity}).",
                            DomainErrorCodes.Dispensing.InsufficientStock));
                        return;
                    }

                    batch.SetReservedQuantity(Math.Max(0, batch.ReservedQuantity - item.ReservedQuantity));
                    batch.SetQuantityAvailable(batch.QuantityAvailable - quantity);
                    batch.SetQuantitySold(batch.QuantitySold + quantity);
                    batch.SetLastUpdated(now);
                    if (batch.Status == BatchLifecycleStatus.Reserved && batch.ReservedQuantity < batch.QuantityAvailable)
                        batch.SetStatus(BatchLifecycleStatus.Active);

                    StockMovement movement = new StockMovement(
                        Guid.NewGuid(),
                        item.MedicineId,
                        batch.Id,
                        StockMovementType.Dispense,
                        quantity,
                        batch.WarehouseZoneId,
                        _user.GetUserId(),
                        reference: prescription.PrescriptionNumber,
                        note: item.ReplacedFromMedicineId.HasValue ? $"Substituted: {item.ReplacementReason}" : null
                    );
                    movement.SetTenantId(_user.GetTenantId());
                    movement.SetCreatedBy(_user.GetUserId());
                    await _stockMovementRepository.InsertAsync<StockMovement, Guid>(movement);
                    movements++;

                    prescriptionItem.SetQuantityDispensed(prescriptionItem.QuantityDispensed + quantity);
                    item.SelectBatch(batch.Id);
                    item.SetReservedQuantity(0);
                    item.SetStatus(DispenseItemStatus.Dispensed);

                    decimal lineTotal = prescriptionItem.PricePerUnit * quantity;
                    if (prescriptionItem.IsInsuranceCovered) insuranceCoverage += lineTotal;
                    else patientPayment += lineTotal;
                }

                bool fullyDispensed = prescription.PrescriptionItems.All(i => i.QuantityDispensed >= i.QuantityPrescribed);
                prescription.SetStatus(fullyDispensed ? PrescriptionStatus.Dispensed : PrescriptionStatus.PartiallyDispensed);

                string? notes = string.IsNullOrWhiteSpace(request.PharmacistNotes) ? null : request.PharmacistNotes.Trim();
                prescription.SetPharmacistNotes(notes);
                session.Complete(_user.GetUserId(), notes, now);

                if (!await CommitAsync())
                {
                    await _unitOfWork.RollbackTransactionAsync(ct);
                    return;
                }

                await _unitOfWork.CommitTransactionAsync(ct);
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync(ct);
                throw;
            }

            request.Summary = new DispenseSummaryViewModel
            {
                WorkspaceId = prescription.Id,
                ItemsDispensedCount = session.Items.Count(i => i.Status == DispenseItemStatus.Dispensed),
                ItemsRemainingCount = prescription.PrescriptionItems.Count(i => i.QuantityDispensed < i.QuantityPrescribed),
                InventoryChangesCount = movements,
                InsuranceCoverageAmount = insuranceCoverage,
                PatientPaymentAmount = patientPayment,
                DispensingTimeSeconds = (int)Math.Max(0, (now - session.StartedAt).TotalSeconds),
                PharmacistName = _user.GetUserEmail()
            };
        }
    }
}
