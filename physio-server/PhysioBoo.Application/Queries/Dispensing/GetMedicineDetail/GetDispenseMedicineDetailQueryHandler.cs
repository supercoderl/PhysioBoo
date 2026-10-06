using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dispensing.GetMedicineDetail
{
    public sealed class GetDispenseMedicineDetailQueryHandler : IRequestHandler<GetDispenseMedicineDetailQuery, DispenseMedicineDetailViewModel?>
    {
        private const int HistorySize = 10;

        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IMediatorHandler _bus;

        public GetDispenseMedicineDetailQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository inventoryRepository,
            IStockMovementRepository stockMovementRepository,
            IMediatorHandler bus
        )
        {
            _medicineRepository = medicineRepository;
            _inventoryRepository = inventoryRepository;
            _stockMovementRepository = stockMovementRepository;
            _bus = bus;
        }

        public async Task<DispenseMedicineDetailViewModel?> Handle(GetDispenseMedicineDetailQuery request, CancellationToken ct)
        {
            DispensingStock stock = await DispensingStock.LoadAsync(_medicineRepository, _inventoryRepository, new[] { request.MedicineId }, ct);

            if (!stock.Medicines.TryGetValue(request.MedicineId, out Medicine? medicine))
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetDispenseMedicineDetailQuery),
                    $"Medicine with id {request.MedicineId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            List<StockMovement> history = await _stockMovementRepository
                .GetAllNoTracking(m => m.MedicineId == request.MedicineId && m.Type == StockMovementType.Dispense,
                    includeProperties: "PerformedByUser.Profile")
                .OrderByDescending(m => m.OccurredAt)
                .Take(HistorySize)
                .ToListAsync(ct);

            return new DispenseMedicineDetailViewModel
            {
                MedicineId = medicine.Id,
                Name = medicine.Name,
                GenericName = medicine.GenericName ?? string.Empty,
                Manufacturer = medicine.Manufacturer?.Name ?? string.Empty,
                StockByLocation = stock.BatchesOf(medicine.Id)
                    .Where(DispensingStock.IsUsable)
                    .GroupBy(DispensingStock.Location)
                    .Select(g => new DispenseStockLocationViewModel { Location = g.Key, Quantity = g.Sum(DispensingStock.FreeQuantity) })
                    .OrderByDescending(l => l.Quantity)
                    .ToList(),
                Alternatives = stock.Alternatives.GetValueOrDefault(medicine.Id) ?? new List<DispenseMedicineAlternativeViewModel>(),
                // The medicine master stores interactions as free text; one entry per line/semicolon.
                InteractionWarnings = (medicine.DrugInteractions ?? string.Empty)
                    .Split(new[] { '\n', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList(),
                DispensingHistory = history.Select(m => new DispenseHistoryEntryViewModel
                {
                    Date = m.OccurredAt,
                    Quantity = m.Quantity,
                    Pharmacist = m.PerformedByUser?.Profile?.FullName ?? m.PerformedByUser?.Email ?? string.Empty
                }).ToList()
            };
        }
    }
}
