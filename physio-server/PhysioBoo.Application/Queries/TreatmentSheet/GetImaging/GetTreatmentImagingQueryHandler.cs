using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetImaging
{
    // Reads the radiology module's orders; nothing is duplicated into the treatment sheet.
    public sealed class GetTreatmentImagingQueryHandler : IRequestHandler<GetTreatmentImagingQuery, PagedResult<TreatmentImagingOrderRowViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetTreatmentImagingQueryHandler(IImagingOrderRepository imagingOrderRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<PagedResult<TreatmentImagingOrderRowViewModel>> Handle(GetTreatmentImagingQuery request, CancellationToken cancellationToken)
        {
            PagedResult<ImagingOrder> paged = await _imagingOrderRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: o => o.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(o => o.CreatedAt),
                includeProperties: "Modality,ImagingReports",
                ct: cancellationToken);

            return new PagedResult<TreatmentImagingOrderRowViewModel>(
                paged.TotalCount,
                paged.Items.Select(TreatmentImagingOrderRowViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
