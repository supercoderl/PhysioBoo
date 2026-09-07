
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseZones
{
    public sealed class GetWarehouseZonesQueryHandler : IRequestHandler<GetWarehouseZonesQuery, List<WarehouseZoneViewModel>>
    {
        private readonly IWarehouseZoneRepository _warehouseZoneRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public GetWarehouseZonesQueryHandler(
            IWarehouseZoneRepository warehouseZoneRepository,
            IMedicineInventoryRepository medicineInventoryRepository
        )
        {
            _warehouseZoneRepository = warehouseZoneRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<List<WarehouseZoneViewModel>> Handle(GetWarehouseZonesQuery request, CancellationToken ct)
        {
            List<WarehouseZone> zones = await _warehouseZoneRepository.GetAllNoTracking().ToListAsync(ct);
            List<MedicineInventory> batches = await _medicineInventoryRepository.GetAllNoTracking().ToListAsync(ct);

            // No explicit capacity figure exists per zone yet — capacity is expressed relative to
            // whichever zone currently holds the most quantity, not a real physical limit.
            int maxZoneQuantity = zones.Count == 0
                ? 0
                : zones.Max(z => batches.Where(b => b.WarehouseZoneId == z.Id).Sum(b => b.QuantityAvailable));

            return zones.Select(z =>
            {
                List<MedicineInventory> zoneBatches = batches.Where(b => b.WarehouseZoneId == z.Id).ToList();
                int zoneQuantity = zoneBatches.Sum(b => b.QuantityAvailable);
                decimal capacityPercent = maxZoneQuantity > 0 ? Math.Round(100m * zoneQuantity / maxZoneQuantity, 1) : 0;

                string activityLevel = zoneBatches.Count switch
                {
                    0 => "Low",
                    <= 10 => "Low",
                    <= 30 => "Medium",
                    _ => "High"
                };

                return new WarehouseZoneViewModel
                {
                    Id = z.Id,
                    Name = z.Name,
                    Type = z.Type,
                    CapacityPercent = capacityPercent,
                    ActivityLevel = activityLevel,
                    HasExpiringStock = zoneBatches.Any(b => b.IsNearExpiry),
                    IsEmpty = zoneQuantity <= 0,
                    IsOverstocked = capacityPercent >= 90
                };
            }).ToList();
        }
    }
}
