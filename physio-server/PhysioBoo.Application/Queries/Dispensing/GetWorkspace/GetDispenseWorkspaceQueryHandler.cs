using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dispensing.GetWorkspace
{
    public sealed class GetDispenseWorkspaceQueryHandler : IRequestHandler<GetDispenseWorkspaceQuery, DispenseWorkspaceViewModel?>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IDispenseSessionRepository _sessionRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IMediatorHandler _bus;

        public GetDispenseWorkspaceQueryHandler(
            IPrescriptionRepository prescriptionRepository,
            IDispenseSessionRepository sessionRepository,
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository inventoryRepository,
            IMediatorHandler bus
        )
        {
            _prescriptionRepository = prescriptionRepository;
            _sessionRepository = sessionRepository;
            _medicineRepository = medicineRepository;
            _inventoryRepository = inventoryRepository;
            _bus = bus;
        }

        public async Task<DispenseWorkspaceViewModel?> Handle(GetDispenseWorkspaceQuery request, CancellationToken ct)
        {
            Prescription? prescription = await _prescriptionRepository
                .GetAllNoTracking(p => p.Id == request.PrescriptionId, includeProperties: DispensingMapper.PrescriptionIncludes)
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (prescription == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetDispenseWorkspaceQuery),
                    $"Prescription with id {request.PrescriptionId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            DispenseSession? session = await _sessionRepository
                .GetAllNoTracking(s => s.PrescriptionId == prescription.Id, includeProperties: "Items")
                .FirstOrDefaultAsync(ct);

            IEnumerable<Guid> medicineIds = prescription.PrescriptionItems.Select(i => i.MedicineId)
                .Concat(session?.Items.Select(i => i.MedicineId) ?? Enumerable.Empty<Guid>());

            DispensingStock stock = await DispensingStock.LoadAsync(_medicineRepository, _inventoryRepository, medicineIds, ct);

            return DispensingMapper.ToWorkspace(prescription, session, stock);
        }
    }
}
