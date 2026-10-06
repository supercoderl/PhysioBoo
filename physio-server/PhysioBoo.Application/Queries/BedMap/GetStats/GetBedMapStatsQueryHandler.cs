using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap.GetStats
{
    public sealed class GetBedMapStatsQueryHandler : IRequestHandler<GetBedMapStatsQuery, BedMapStatsViewModel>
    {
        private readonly IBedRepository _bedRepository;

        public GetBedMapStatsQueryHandler(IBedRepository bedRepository)
        {
            _bedRepository = bedRepository;
        }

        public async Task<BedMapStatsViewModel> Handle(GetBedMapStatsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Bed> beds = _bedRepository.GetAllNoTracking();

            var counts = await beds
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            int Count(BedStatus status) => counts.FirstOrDefault(c => c.Status == status)?.Count ?? 0;

            int total = counts.Sum(c => c.Count);
            int occupied = Count(BedStatus.Occupied);

            return new BedMapStatsViewModel
            {
                TotalBeds = total,
                AvailableBeds = Count(BedStatus.Available),
                OccupiedBeds = occupied,
                MaintenanceBeds = Count(BedStatus.Maintenance),
                ReservedBeds = Count(BedStatus.Reserved),
                OccupancyRate = total == 0 ? 0 : Math.Round(occupied * 100.0 / total, 1)
            };
        }
    }
}
