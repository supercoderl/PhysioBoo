namespace PhysioBoo.Domain.Entities.Inpatient
{
    // Append-only fluid balance entry.
    public class IntakeOutputEntry : TenantEntity
    {
        #region Core IntakeOutputEntry Table (8)
        public Guid PatientId { get; private set; }
        public DateTime RecordedAt { get; private set; }
        public string RecordedByName { get; private set; }
        public IntakeOutputDirection Direction { get; private set; }
        public IntakeOutputCategory Category { get; private set; }
        public int VolumeMl { get; private set; }
        public string? Notes { get; private set; }
        #endregion

        #region Constructor (8)
        public IntakeOutputEntry(
            Guid id,
            Guid patientId,
            DateTime recordedAt,
            string recordedByName,
            IntakeOutputDirection direction,
            IntakeOutputCategory category,
            int volumeMl,
            string? notes
        ) : base(id)
        {
            PatientId = patientId;
            RecordedAt = recordedAt;
            RecordedByName = recordedByName;
            Direction = direction;
            Category = category;
            VolumeMl = volumeMl;
            Notes = notes;
        }
        #endregion
    }
}
