
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetWarehouses
{
    public sealed class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, List<WarehouseLookupViewModel>>
    {
        private readonly IHospitalRepository _hospitalRepository;

        public GetWarehousesQueryHandler(IHospitalRepository hospitalRepository)
        {
            _hospitalRepository = hospitalRepository;
        }

        public async Task<List<WarehouseLookupViewModel>> Handle(GetWarehousesQuery request, CancellationToken ct)
        {
            List<Hospital> hospitals = await _hospitalRepository.GetAllNoTracking().ToListAsync(ct);

            return hospitals.Select(h => new WarehouseLookupViewModel { Id = h.Id, Name = h.Name }).ToList();
        }
    }
}
