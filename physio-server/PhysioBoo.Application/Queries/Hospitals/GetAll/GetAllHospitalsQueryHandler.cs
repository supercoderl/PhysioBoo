using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Hospitals.GetAll
{
    public sealed class GetAllHospitalsQueryHandler : IRequestHandler<GetAllHospitalsQuery, PagedResult<HospitalViewModel>>
    {
        private readonly IHospitalRepository _hospitalRepository;
        private readonly ISortingExpressionProvider<HospitalViewModel, Hospital> _sortingExpressionProvider;

        public GetAllHospitalsQueryHandler(
            IHospitalRepository hospitalRepository,
            ISortingExpressionProvider<HospitalViewModel, Hospital> sortingExpressionProvider
        )
        {
            _hospitalRepository = hospitalRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<HospitalViewModel>> Handle(GetAllHospitalsQuery q, CancellationToken cancellationToken)
        {
            HospitalsSearchSpec spec = new HospitalsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Hospital> paged = await _hospitalRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<HospitalViewModel> items = paged.Items.Select(h => HospitalViewModel.FromHospital(h)).ToList();
            return new PagedResult<HospitalViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
