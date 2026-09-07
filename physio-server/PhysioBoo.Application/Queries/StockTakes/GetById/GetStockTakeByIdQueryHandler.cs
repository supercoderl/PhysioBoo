
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetById
{
    public sealed class GetStockTakeByIdQueryHandler : IRequestHandler<GetStockTakeByIdQuery, StockTakeViewModel?>
    {
        private readonly IStockTakeRepository _stockTakeRepository;

        public GetStockTakeByIdQueryHandler(IStockTakeRepository stockTakeRepository)
        {
            _stockTakeRepository = stockTakeRepository;
        }

        public async Task<StockTakeViewModel?> Handle(GetStockTakeByIdQuery request, CancellationToken ct)
        {
            StockTake? stockTake = await _stockTakeRepository.GetByIdAsync(
                request.Id,
                includeProperties: "Hospital,Department,Creator,AssignedToUser,StockTakeItems.MedicineInventory",
                ct: ct
            );

            return stockTake == null ? null : StockTakeViewModel.FromStockTake(stockTake);
        }
    }
}
