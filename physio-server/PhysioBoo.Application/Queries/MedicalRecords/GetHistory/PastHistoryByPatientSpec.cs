using Ardalis.Specification;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetHistory
{
    public sealed class PastHistoryByPatientSpec : Specification<MedicalRecord>
    {
        public PastHistoryByPatientSpec(Guid PatientId)
        {
            Query.Where(x => x.PatientId == PatientId).OrderByDescending(x => x.CreatedAt);
        }
    }
}
