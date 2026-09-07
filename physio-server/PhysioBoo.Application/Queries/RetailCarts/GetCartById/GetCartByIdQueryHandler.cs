
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetCartById
{
    public sealed class GetCartByIdQueryHandler : IRequestHandler<GetCartByIdQuery, RetailCartViewModel?>
    {
        private readonly IRetailCartRepository _retailCartRepository;

        public GetCartByIdQueryHandler(IRetailCartRepository retailCartRepository)
        {
            _retailCartRepository = retailCartRepository;
        }

        public async Task<RetailCartViewModel?> Handle(GetCartByIdQuery request, CancellationToken ct)
        {
            RetailCart? cart = await _retailCartRepository.GetByIdAsync(
                request.CartId, includeProperties: "RetailCartLineItems.Medicine", ct: ct);

            return cart == null ? null : RetailCartViewModel.FromRetailCart(cart);
        }
    }
}
