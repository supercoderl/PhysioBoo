using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPatientAllergies
{
    public sealed record GetMedicalRecordPatientAllergiesQuery(Guid PatientId) : IRequest<PagedResult<PatientAllergyViewModel>>;
}
