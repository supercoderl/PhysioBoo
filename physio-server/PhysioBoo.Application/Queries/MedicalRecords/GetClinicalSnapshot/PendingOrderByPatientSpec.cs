using Ardalis.Specification;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed class PendingOrderByPatientSpec : Specification<LabOrder>
    {
        public PendingOrderByPatientSpec(Guid PatientId)
        {
            Query.Where(x => x.PatientId == PatientId && x.PaymentStatus == Domain.Enums.PaymentStatus.Pending);
        }
    }
}
