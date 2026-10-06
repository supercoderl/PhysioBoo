using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetMar
{
    public sealed class GetMarQueryHandler : IRequestHandler<GetMarQuery, PagedResult<MarEntryViewModel>>
    {
        private readonly IMedicationAdministrationRepository _medicationRepository;

        public GetMarQueryHandler(IMedicationAdministrationRepository medicationRepository)
        {
            _medicationRepository = medicationRepository;
        }

        public async Task<PagedResult<MarEntryViewModel>> Handle(GetMarQuery request, CancellationToken cancellationToken)
        {
            PagedResult<MedicationAdministration> paged = await _medicationRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: m => m.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(m => m.ScheduledAt),
                ct: cancellationToken);

            return new PagedResult<MarEntryViewModel>(
                paged.TotalCount,
                paged.Items.Select(MarEntryViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
