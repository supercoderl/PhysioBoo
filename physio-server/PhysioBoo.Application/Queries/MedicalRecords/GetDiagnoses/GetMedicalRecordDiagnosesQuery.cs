using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetDiagnoses
{
    public sealed record GetMedicalRecordDiagnosesQuery(Guid PatientId) : IRequest<PagedResult<DiagnosisViewModel>>;
}
