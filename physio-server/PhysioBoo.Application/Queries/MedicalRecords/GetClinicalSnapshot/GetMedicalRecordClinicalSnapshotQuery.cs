using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed record GetMedicalRecordClinicalSnapshotQuery(Guid PatientId) : IRequest<ClinicalSnapshotViewModel?>;
}
