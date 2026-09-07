
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetInsight
{
    public sealed record GetInsightQuery() : IRequest<RetailInventoryInsightViewModel>;
}
