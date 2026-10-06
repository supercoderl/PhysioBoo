using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed class BedHistoryEntryViewModel
    {
        public Guid Id { get; set; }
        public Guid BedId { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string? AssignedBy { get; set; }

        public static BedHistoryEntryViewModel FromEntity(BedAssignment entity)
        {
            return new BedHistoryEntryViewModel
            {
                Id = entity.Id,
                BedId = entity.BedId,
                PatientId = entity.PatientId,
                PatientName = entity.Patient?.Profile?.FullName ?? string.Empty,
                AdmissionDate = entity.AdmittedAt,
                DischargeDate = entity.DischargedAt,
                AssignedBy = entity.AssignedByName
            };
        }
    }
}
