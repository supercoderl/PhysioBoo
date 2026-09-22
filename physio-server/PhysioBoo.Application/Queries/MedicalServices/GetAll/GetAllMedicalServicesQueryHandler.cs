using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalServices.GetAll
{
    public sealed class GetAllMedicalServicesQueryHandler : IRequestHandler<GetAllMedicalServicesQuery, PagedResult<MedicalServiceViewModel>>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly ISortingExpressionProvider<MedicalServiceViewModel, MedicalService> _sortingExpressionProvider;

        public GetAllMedicalServicesQueryHandler(
            IMedicalServiceRepository medicalServiceRepository,
            ISortingExpressionProvider<MedicalServiceViewModel, MedicalService> sortingExpressionProvider
        )
        {
            _medicalServiceRepository = medicalServiceRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<MedicalServiceViewModel>> Handle(GetAllMedicalServicesQuery q, CancellationToken ct)
        {
            MedicalServicesSearchSpec spec = new MedicalServicesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<MedicalService> paged = await _medicalServiceRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<MedicalServiceViewModel> items = paged.Items.Select(ms => MedicalServiceViewModel.FromEntity(ms)).ToList();
            return new PagedResult<MedicalServiceViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
