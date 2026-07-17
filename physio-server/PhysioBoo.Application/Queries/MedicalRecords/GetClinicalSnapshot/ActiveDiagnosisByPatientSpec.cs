using Ardalis.Specification;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed class ActiveDiagnosisByPatientSpec : Specification<PatientMedicalHistory>
    {
        public ActiveDiagnosisByPatientSpec(Guid PatientId)
        {
            Query.Where(x => x.PatientId == PatientId && x.CurrentStatus == Domain.Enums.CurrentStatus.Active);
        }
    }
}
