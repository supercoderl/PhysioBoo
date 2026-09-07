
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetCarts
{
    public sealed record GetCartsQuery() : IRequest<List<RetailCartViewModel>>;
}
