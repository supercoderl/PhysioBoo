using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetStats
{
    // Range: today (default), week or month.
    public sealed record GetSurgeryStatsQuery(string? Range) : IRequest<SurgeryStatsViewModel>;
}
