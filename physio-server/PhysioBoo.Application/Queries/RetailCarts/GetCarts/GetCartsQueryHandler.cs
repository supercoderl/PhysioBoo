
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetCarts
{
    public sealed class GetCartsQueryHandler : IRequestHandler<GetCartsQuery, List<RetailCartViewModel>>
    {
        private readonly IRetailCartRepository _retailCartRepository;

        public GetCartsQueryHandler(IRetailCartRepository retailCartRepository)
        {
            _retailCartRepository = retailCartRepository;
        }

        public async Task<List<RetailCartViewModel>> Handle(GetCartsQuery request, CancellationToken ct)
        {
            List<RetailCart> carts = await _retailCartRepository
                .GetAllNoTracking(includeProperties: "RetailCartLineItems.Medicine")
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(ct);

            return carts.Select(c => RetailCartViewModel.FromRetailCart(c)).ToList();
        }
    }
}
