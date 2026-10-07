using PhysioBoo.Application.ViewModels.Dashboard;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    /// <param name="Date">Day to report on (defaults to today, hospital local time).</param>
    /// <param name="Shift">morning, afternoon or night; only changes the shift label.</param>
    public sealed record GetDashboardOverviewQuery(DateOnly? Date, string? Shift) : IRequest<DashboardOverviewViewModel>;
}
