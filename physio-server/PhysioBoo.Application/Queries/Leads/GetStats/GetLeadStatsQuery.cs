using PhysioBoo.Application.ViewModels.Leads;

namespace PhysioBoo.Application.Queries.Leads.GetStats
{
    public sealed record GetLeadStatsQuery : IRequest<LeadStatsViewModel>;
}
