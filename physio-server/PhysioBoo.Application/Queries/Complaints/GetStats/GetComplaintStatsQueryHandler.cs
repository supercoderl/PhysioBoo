using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Complaints.GetStats
{
    public sealed class GetComplaintStatsQueryHandler : IRequestHandler<GetComplaintStatsQuery, ComplaintStatsViewModel>
    {
        private readonly IComplaintRepository _complaintRepository;

        public GetComplaintStatsQueryHandler(IComplaintRepository complaintRepository)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task<ComplaintStatsViewModel> Handle(GetComplaintStatsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Complaint> complaints = _complaintRepository.GetAllNoTracking();
            return new ComplaintStatsViewModel
            {
                Total = await complaints.CountAsync(cancellationToken),
                Pending = await complaints.CountAsync(c => c.Status == ComplaintStatus.Pending, cancellationToken),
                InProgress = await complaints.CountAsync(c => c.Status == ComplaintStatus.InProgress, cancellationToken),
                Resolved = await complaints.CountAsync(c => c.Status == ComplaintStatus.Resolved, cancellationToken)
            };
        }
    }
}
