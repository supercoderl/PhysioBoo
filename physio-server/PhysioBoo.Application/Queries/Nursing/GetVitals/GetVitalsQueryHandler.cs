using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetVitals
{
    public sealed class GetVitalsQueryHandler : IRequestHandler<GetVitalsQuery, PagedResult<VitalsReadingViewModel>>
    {
        private readonly IVitalSignRepository _vitalSignRepository;

        public GetVitalsQueryHandler(IVitalSignRepository vitalSignRepository)
        {
            _vitalSignRepository = vitalSignRepository;
        }

        public async Task<PagedResult<VitalsReadingViewModel>> Handle(GetVitalsQuery request, CancellationToken cancellationToken)
        {
            PagedResult<VitalSign> paged = await _vitalSignRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: v => v.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(v => v.RecordedAt),
                ct: cancellationToken);

            return new PagedResult<VitalsReadingViewModel>(
                paged.TotalCount,
                paged.Items.Select(VitalsReadingViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
