using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetMedications
{
    public sealed class GetTreatmentMedicationsQueryHandler : IRequestHandler<GetTreatmentMedicationsQuery, PagedResult<MedicationAdministrationViewModel>>
    {
        private readonly IMedicationAdministrationRepository _medicationRepository;

        public GetTreatmentMedicationsQueryHandler(IMedicationAdministrationRepository medicationRepository)
        {
            _medicationRepository = medicationRepository;
        }

        public async Task<PagedResult<MedicationAdministrationViewModel>> Handle(GetTreatmentMedicationsQuery request, CancellationToken cancellationToken)
        {
            PagedResult<MedicationAdministration> paged = await _medicationRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: m => m.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(m => m.ScheduledAt),
                ct: cancellationToken);

            return new PagedResult<MedicationAdministrationViewModel>(
                paged.TotalCount,
                paged.Items.Select(MedicationAdministrationViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
