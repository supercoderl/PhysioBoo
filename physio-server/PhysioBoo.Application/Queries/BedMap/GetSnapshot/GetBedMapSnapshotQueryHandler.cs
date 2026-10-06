using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap.GetSnapshot
{
    public sealed class GetBedMapSnapshotQueryHandler : IRequestHandler<GetBedMapSnapshotQuery, BedMapSnapshotViewModel>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IBedRepository _bedRepository;

        public GetBedMapSnapshotQueryHandler(
            IWardRepository wardRepository,
            IBedRepository bedRepository
        )
        {
            _wardRepository = wardRepository;
            _bedRepository = bedRepository;
        }

        public async Task<BedMapSnapshotViewModel> Handle(GetBedMapSnapshotQuery request, CancellationToken cancellationToken)
        {
            List<WardViewModel> wards = await WardViewModelBuilder.BuildAsync(_wardRepository, _bedRepository, cancellationToken);

            // Ward name and the occupying patient are shown on the map (no lazy loading).
            List<Bed> beds = await _bedRepository
                .GetAllNoTracking(
                    orderBy: q => q.OrderBy(b => b.Floor).ThenBy(b => b.Number),
                    includeProperties: "Ward,CurrentAssignment.Patient.Profile")
                .ToListAsync(cancellationToken);

            return new BedMapSnapshotViewModel
            {
                Wards = wards,
                Beds = beds.Select(BedViewModel.FromEntity).ToList()
            };
        }
    }
}
