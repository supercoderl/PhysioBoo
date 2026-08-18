using Ardalis.Specification;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed class ActiveMedicationByPatientSpec : Specification<Prescription>
    {
        public ActiveMedicationByPatientSpec(Guid PatientId)
        {
            Query.Where(x => x.PatientId == PatientId && x.Status == Domain.Enums.PrescriptionStatus.Active);
        }
    }
}
