namespace PhysioBoo.Domain.Entities.Inpatient
{
    // The single medication administration record (MAR). Nursing and the treatment sheet are two
    // views of these rows.
    public class MedicationAdministration : TenantEntity
    {
        #region Core MedicationAdministration Table (10)
        public Guid PatientId { get; private set; }
        public string MedicationName { get; private set; }
        public string Dose { get; private set; }
        public string Route { get; private set; }
        public string Frequency { get; private set; }
        public DateTime ScheduledAt { get; private set; }
        public AdministrationStatus Status { get; private set; }
        public DateTime? AdministeredAt { get; private set; }
        public string? AdministeredByName { get; private set; }
        public string? Notes { get; private set; }
        #endregion

        #region Constructor (10)
        public MedicationAdministration(
            Guid id,
            Guid patientId,
            string medicationName,
            string dose,
            string route,
            string frequency,
            DateTime scheduledAt
        ) : base(id)
        {
            PatientId = patientId;
            MedicationName = medicationName;
            Dose = dose;
            Route = route;
            Frequency = frequency;
            ScheduledAt = scheduledAt;
            Status = AdministrationStatus.Scheduled;
            AdministeredAt = null;
            AdministeredByName = null;
            Notes = null;
        }
        #endregion

        #region Setter Methods (10)
        public void SetMedicationName(string medicationName) { MedicationName = medicationName; }
        public void SetDose(string dose) { Dose = dose; }
        public void SetRoute(string route) { Route = route; }
        public void SetFrequency(string frequency) { Frequency = frequency; }
        public void SetScheduledAt(DateTime scheduledAt) { ScheduledAt = scheduledAt; }
        public void SetStatus(AdministrationStatus status) { Status = status; }
        public void SetAdministeredAt(DateTime? administeredAt) { AdministeredAt = administeredAt; }
        public void SetAdministeredByName(string? administeredByName) { AdministeredByName = administeredByName; }
        public void SetNotes(string? notes) { Notes = notes; }
        #endregion
    }
}
