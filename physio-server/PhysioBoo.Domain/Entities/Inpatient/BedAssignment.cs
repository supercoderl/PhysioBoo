using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Inpatient
{
    // One patient's stay in one bed. Open while DischargedAt is null.
    public class BedAssignment : TenantEntity
    {
        #region Core BedAssignment Table (8)
        public Guid BedId { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid? AdmissionId { get; private set; }
        public DateTime AdmittedAt { get; private set; }
        public DateTime? ExpectedDischargeDate { get; private set; }
        public DateTime? DischargedAt { get; private set; }
        public string? Notes { get; private set; }
        public string? AssignedByName { get; private set; }

        public virtual Bed? Bed { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual Admission? Admission { get; private set; }
        #endregion

        #region Constructor (8)
        public BedAssignment(
            Guid id,
            Guid bedId,
            Guid patientId,
            Guid? admissionId,
            DateTime? expectedDischargeDate,
            string? notes,
            string? assignedByName
        ) : base(id)
        {
            BedId = bedId;
            PatientId = patientId;
            AdmissionId = admissionId;
            AdmittedAt = TimeZoneHelper.GetLocalTimeNow();
            ExpectedDischargeDate = expectedDischargeDate;
            DischargedAt = null;
            Notes = notes;
            AssignedByName = assignedByName;
        }
        #endregion

        #region Setter Methods (8)
        public void SetExpectedDischargeDate(DateTime? expectedDischargeDate) { ExpectedDischargeDate = expectedDischargeDate; }
        public void SetDischargedAt(DateTime? dischargedAt) { DischargedAt = dischargedAt; }
        public void SetNotes(string? notes) { Notes = notes; }
        #endregion
    }
}
