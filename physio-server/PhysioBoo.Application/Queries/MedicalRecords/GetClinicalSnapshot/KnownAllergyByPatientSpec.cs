using Ardalis.Specification;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed class KnownAllergyByPatientSpec : Specification<PatientAllergy>
    {
        public KnownAllergyByPatientSpec(Guid PatientId)
        {
            Query.Where(x => x.PatientId == PatientId && x.IsActive);
        }
    }
}
