namespace PhysioBoo.Domain.Entities.Inpatient
{
    // Append-only reading. IsAbnormal is decided by the server when the reading is recorded.
    public class VitalSign : TenantEntity
    {
        #region Core VitalSign Table (10)
        public Guid PatientId { get; private set; }
        public DateTime RecordedAt { get; private set; }
        public string RecordedByName { get; private set; }
        public int BloodPressureSystolic { get; private set; }
        public int BloodPressureDiastolic { get; private set; }
        public int HeartRate { get; private set; }
        public decimal Temperature { get; private set; }
        public int RespiratoryRate { get; private set; }
        public int Spo2 { get; private set; }
        public bool IsAbnormal { get; private set; }
        #endregion

        #region Constructor (10)
        public VitalSign(
            Guid id,
            Guid patientId,
            DateTime recordedAt,
            string recordedByName,
            int bloodPressureSystolic,
            int bloodPressureDiastolic,
            int heartRate,
            decimal temperature,
            int respiratoryRate,
            int spo2,
            bool isAbnormal
        ) : base(id)
        {
            PatientId = patientId;
            RecordedAt = recordedAt;
            RecordedByName = recordedByName;
            BloodPressureSystolic = bloodPressureSystolic;
            BloodPressureDiastolic = bloodPressureDiastolic;
            HeartRate = heartRate;
            Temperature = temperature;
            RespiratoryRate = respiratoryRate;
            Spo2 = spo2;
            IsAbnormal = isAbnormal;
        }
        #endregion
    }
}
