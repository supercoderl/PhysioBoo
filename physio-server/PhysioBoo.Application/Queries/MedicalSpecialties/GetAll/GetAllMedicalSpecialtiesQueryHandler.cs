using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetAll
{
    public sealed class GetAllMedicalSpecialtiesQueryHandler : IRequestHandler<GetAllMedicalSpecialtiesQuery, PagedResult<MedicalSpecialtyViewModel>>
    {
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;
        private readonly ISortingExpressionProvider<MedicalSpecialtyViewModel, MedicalSpecialty> _sortingExpressionProvider;

        public GetAllMedicalSpecialtiesQueryHandler(
            IMedicalSpecialtyRepository medicalSpecialtyRepository,
            ISortingExpressionProvider<MedicalSpecialtyViewModel, MedicalSpecialty> sortingExpressionProvider
        )
        {
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<MedicalSpecialtyViewModel>> Handle(GetAllMedicalSpecialtiesQuery q, CancellationToken cancellationToken)
        {
            MedicalSpecialtiesSearchSpec spec = new MedicalSpecialtiesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<MedicalSpecialty> paged = await _medicalSpecialtyRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<MedicalSpecialtyViewModel> items = paged.Items.Select(ms => MedicalSpecialtyViewModel.FromMedicalSpecialty(ms)).ToList();
            return new PagedResult<MedicalSpecialtyViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
