using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPatientDemoGraphics
{
    public sealed record GetMedicalRecordPatientDemoGraphicsQuery(Guid PatientId) : IRequest<PatientDemographicsViewModel?>;
}
