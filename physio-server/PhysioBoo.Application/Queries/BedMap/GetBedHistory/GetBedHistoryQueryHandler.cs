using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap.GetBedHistory
{
    public sealed class GetBedHistoryQueryHandler : IRequestHandler<GetBedHistoryQuery, List<BedHistoryEntryViewModel>>
    {
        private const int MaxEntries = 50;

        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetBedHistoryQueryHandler(IBedAssignmentRepository bedAssignmentRepository)
        {
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<List<BedHistoryEntryViewModel>> Handle(GetBedHistoryQuery request, CancellationToken cancellationToken)
        {
            List<BedAssignment> stays = await _bedAssignmentRepository
                .GetAllNoTracking(
                    filter: a => a.BedId == request.BedId,
                    orderBy: q => q.OrderByDescending(a => a.AdmittedAt),
                    includeProperties: "Patient.Profile")
                .Take(MaxEntries)
                .ToListAsync(cancellationToken);

            return stays.Select(BedHistoryEntryViewModel.FromEntity).ToList();
        }
    }
}
