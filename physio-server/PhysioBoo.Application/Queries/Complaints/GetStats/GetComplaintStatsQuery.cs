using PhysioBoo.Application.ViewModels.Complaints;

namespace PhysioBoo.Application.Queries.Complaints.GetStats
{
    public sealed record GetComplaintStatsQuery : IRequest<ComplaintStatsViewModel>;
}
