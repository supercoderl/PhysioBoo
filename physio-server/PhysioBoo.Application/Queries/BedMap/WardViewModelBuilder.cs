using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap
{
    // Wards with their bed counts. Shared by the wards and snapshot queries.
    internal static class WardViewModelBuilder
    {
        public static async Task<List<WardViewModel>> BuildAsync(
            IWardRepository wardRepository,
            IBedRepository bedRepository,
            CancellationToken cancellationToken)
        {
            List<Ward> wards = await wardRepository
                .GetAllNoTracking(orderBy: q => q.OrderBy(w => w.Floor).ThenBy(w => w.Name), includeProperties: "Department")
                .ToListAsync(cancellationToken);

            var counts = await bedRepository
                .GetAllNoTracking()
                .GroupBy(b => new { b.WardId, b.Status })
                .Select(g => new { g.Key.WardId, g.Key.Status, Count = g.Count() })
                .ToListAsync(cancellationToken);

            List<WardViewModel> result = new();
            foreach (Ward ward in wards)
            {
                WardViewModel model = WardViewModel.FromEntity(ward);
                foreach (var row in counts.Where(c => c.WardId == ward.Id))
                {
                    model.TotalBeds += row.Count;
                    switch (row.Status)
                    {
                        case BedStatus.Available: model.AvailableBeds = row.Count; break;
                        case BedStatus.Occupied: model.OccupiedBeds = row.Count; break;
                        case BedStatus.Maintenance: model.MaintenanceBeds = row.Count; break;
                        case BedStatus.Reserved: model.ReservedBeds = row.Count; break;
                    }
                }
                result.Add(model);
            }

            return result;
        }
    }
}
