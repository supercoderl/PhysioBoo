using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetTrends
{
    // Range: week (default), today or month.
    public sealed record GetSurgeryTrendsQuery(string? Range) : IRequest<SurgeryTrendViewModel>;
}
