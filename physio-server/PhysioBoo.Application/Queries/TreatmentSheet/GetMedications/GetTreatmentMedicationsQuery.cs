using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetMedications
{
    public sealed record GetTreatmentMedicationsQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<MedicationAdministrationViewModel>>;
}
