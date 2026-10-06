using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Queries.Nursing.GetPatient
{
    public sealed record GetNursingPatientQuery(Guid PatientId) : IRequest<NursingPatientViewModel?>;
}
