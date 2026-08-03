using MediatR;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.ImagingModalities.GetAll
{
    public sealed class GetAllImagingModalitiesQueryHandler : IRequestHandler<GetAllImagingModalitiesQuery, PagedResult<ImagingModalityViewModel>>
    {
        private readonly IImagingModalityRepository _imagingModalityRepository;
        private readonly ISortingExpressionProvider<ImagingModalityViewModel, ImagingModality> _sortingExpressionProvider;

        public GetAllImagingModalitiesQueryHandler(
            IImagingModalityRepository imagingModalityRepository,
            ISortingExpressionProvider<ImagingModalityViewModel, ImagingModality> sortingExpressionProvider
        )
        {
            _imagingModalityRepository = imagingModalityRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<ImagingModalityViewModel>> Handle(GetAllImagingModalitiesQuery q, CancellationToken ct)
        {
            ImagingModalitiesSearchSpec spec = new ImagingModalitiesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<ImagingModality> paged = await _imagingModalityRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<ImagingModalityViewModel> items = paged.Items.Select(im => ImagingModalityViewModel.FromImagingModality(im)).ToList();
            return new PagedResult<ImagingModalityViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
