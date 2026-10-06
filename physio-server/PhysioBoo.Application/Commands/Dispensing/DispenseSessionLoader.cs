using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dispensing
{
    public sealed record DispenseContext(Prescription Prescription, DispenseSession Session)
    {
        public PrescriptionItem? FindPrescriptionItem(Guid prescriptionItemId) =>
            Prescription.PrescriptionItems.FirstOrDefault(i => i.Id == prescriptionItemId);

        public DispenseSessionItem? FindItem(Guid prescriptionItemId) =>
            Session.Items.FirstOrDefault(i => i.PrescriptionItemId == prescriptionItemId);

        public int Remaining(Guid prescriptionItemId)
        {
            PrescriptionItem? item = FindPrescriptionItem(prescriptionItemId);
            return item == null ? 0 : Math.Max(0, item.QuantityPrescribed - item.QuantityDispensed);
        }

        public void RefreshProgress() => Session.RefreshProgress(DispensingMapper.HasUnacknowledgedCritical(Prescription));
    }

    /// <summary>
    /// Loads the tracked prescription + dispensing session, starting (or reopening) the session on
    /// the pharmacist's first action. Every dispensing command goes through here.
    /// </summary>
    public sealed class DispenseSessionLoader
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IDispenseSessionRepository _sessionRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IUser _user;

        public DispenseSessionLoader(
            IPrescriptionRepository prescriptionRepository,
            IDispenseSessionRepository sessionRepository,
            IMedicineInventoryRepository inventoryRepository,
            IUser user
        )
        {
            _prescriptionRepository = prescriptionRepository;
            _sessionRepository = sessionRepository;
            _inventoryRepository = inventoryRepository;
            _user = user;
        }

        /// <returns>The context, or an error (message, code) when the prescription can't be worked on.</returns>
        public async Task<(DispenseContext? Context, string? Error, string? Code)> LoadAsync(Guid prescriptionId, CancellationToken ct)
        {
            Prescription? prescription = await _prescriptionRepository
                .GetAll(p => p.Id == prescriptionId, includeProperties: "PrescriptionItems.PrescriptionClinicalWarnings")
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (prescription == null)
                return (null, $"Prescription with id {prescriptionId} doesn't exist.", ErrorCodes.ObjectNotFound);

            DispenseSession? session = await _sessionRepository
                .GetAll(s => s.PrescriptionId == prescriptionId, includeProperties: "Items")
                .FirstOrDefaultAsync(ct);

            bool dispensable = DispensingMapper.DispensableStatuses.Contains(prescription.Status);

            if (session != null)
            {
                if (session.Status == DispenseStatus.Completed && dispensable)
                {
                    session.Reopen(TimeZoneHelper.GetLocalTimeNow(), id =>
                    {
                        PrescriptionItem? pi = prescription.PrescriptionItems.FirstOrDefault(i => i.Id == id);
                        return pi == null ? 0 : Math.Max(0, pi.QuantityPrescribed - pi.QuantityDispensed);
                    });
                }
                else if (session.IsClosed)
                {
                    return (null, $"Dispensing for {prescription.PrescriptionNumber} is already {session.Status.ToString().ToLowerInvariant()}.", DomainErrorCodes.Dispensing.SessionClosed);
                }

                return (new DispenseContext(prescription, session), null, null);
            }

            if (!dispensable)
                return (null, $"Prescription {prescription.PrescriptionNumber} is {prescription.Status} and cannot be dispensed.", DomainErrorCodes.Dispensing.NotDispensable);

            session = await StartAsync(prescription, ct);
            return (new DispenseContext(prescription, session), null, null);
        }

        private async Task<DispenseSession> StartAsync(Prescription prescription, CancellationToken ct)
        {
            DispenseSession session = new DispenseSession(Guid.NewGuid(), prescription.Id, _user.GetUserId(), TimeZoneHelper.GetLocalTimeNow());
            session.SetTenantId(_user.GetTenantId());
            session.SetCreatedBy(_user.GetUserId());

            List<Guid> medicineIds = prescription.PrescriptionItems.Select(i => i.MedicineId).Distinct().ToList();
            List<MedicineInventory> batches = await _inventoryRepository
                .GetAllNoTracking(b => medicineIds.Contains(b.MedicineId))
                .OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue)
                .ToListAsync(ct);

            foreach (PrescriptionItem pi in prescription.PrescriptionItems)
            {
                int remaining = Math.Max(0, pi.QuantityPrescribed - pi.QuantityDispensed);
                List<MedicineInventory> usable = batches.Where(b => b.MedicineId == pi.MedicineId && DispensingStock.IsUsable(b)).ToList();
                MedicineInventory? fefo = usable.FirstOrDefault(b => DispensingStock.FreeQuantity(b) >= remaining) ?? usable.FirstOrDefault();

                DispenseSessionItem item = new DispenseSessionItem(Guid.NewGuid(), session.Id, pi.Id, pi.MedicineId, fefo?.Id, remaining);
                item.SetTenantId(_user.GetTenantId());
                item.SetCreatedBy(_user.GetUserId());
                if (remaining == 0) item.SetStatus(DispenseItemStatus.Dispensed);

                session.Items.Add(item);
            }

            _sessionRepository.Add(session);
            return session;
        }

        /// <summary>
        /// Returns any stock this line has reserved back to its batch.
        /// </summary>
        public async Task ReleaseReservationAsync(DispenseSessionItem item, CancellationToken ct)
        {
            if (item.ReservedQuantity <= 0 || item.MedicineInventoryId == null) return;

            MedicineInventory? batch = await _inventoryRepository.GetByIdAsync(item.MedicineInventoryId.Value, ct: ct);
            if (batch != null)
            {
                batch.SetReservedQuantity(Math.Max(0, batch.ReservedQuantity - item.ReservedQuantity));
                if (batch.Status == BatchLifecycleStatus.Reserved && batch.ReservedQuantity < batch.QuantityAvailable)
                    batch.SetStatus(BatchLifecycleStatus.Active);
            }

            item.SetReservedQuantity(0);
        }
    }
}
