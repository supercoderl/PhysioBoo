
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetCartById
{
    public sealed record GetCartByIdQuery(Guid CartId) : IRequest<RetailCartViewModel?>;
}
