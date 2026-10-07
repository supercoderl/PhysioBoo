using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetStudies
{
    public sealed class GetStudiesQueryHandler : IRequestHandler<GetStudiesQuery, PagedResult<StudyRecordViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetStudiesQueryHandler(IImagingOrderRepository imagingOrderRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<PagedResult<StudyRecordViewModel>> Handle(GetStudiesQuery request, CancellationToken ct)
        {
            // A study exists once acquisition has started.
            IQueryable<ImagingOrder> query = _imagingOrderRepository
                .GetAllNoTracking(o => o.ImagingStartedAt != null, includeProperties: RadiologyWorkspace.OrderIncludes)
                .OrderByDescending(o => o.ImagingStartedAt);

            int total = await query.CountAsync(ct);
            List<ImagingOrder> orders = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            List<StudyRecordViewModel> studies = await StudyComparisons.MapAsync(_imagingOrderRepository, orders, ct);
            return new PagedResult<StudyRecordViewModel>(total, studies, request.PageNumber, request.PageSize);
        }
    }
}
