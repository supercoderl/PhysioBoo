using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetContext
{
    public sealed record GetMedicalRecordContextQuery(Guid PatientId) : IRequest<PatientContextViewModel?>;
}
