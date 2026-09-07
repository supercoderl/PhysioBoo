
using PhysioBoo.Application.ViewModels.Cashier;

namespace PhysioBoo.Application.Queries.Cashier.GetDashboardStats
{
    public sealed record GetCashierDashboardStatsQuery() : IRequest<CashierDashboardStatsViewModel>;
}
