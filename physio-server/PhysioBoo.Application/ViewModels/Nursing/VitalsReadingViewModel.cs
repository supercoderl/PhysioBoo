using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class VitalsReadingViewModel
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public DateTime RecordedAt { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public int BloodPressureSystolic { get; set; }
        public int BloodPressureDiastolic { get; set; }
        public int HeartRate { get; set; }
        public decimal Temperature { get; set; }
        public int RespiratoryRate { get; set; }
        public int Spo2 { get; set; }
        public bool IsAbnormal { get; set; }

        public static VitalsReadingViewModel FromEntity(VitalSign entity)
        {
            return new VitalsReadingViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                RecordedAt = entity.RecordedAt,
                RecordedBy = entity.RecordedByName,
                BloodPressureSystolic = entity.BloodPressureSystolic,
                BloodPressureDiastolic = entity.BloodPressureDiastolic,
                HeartRate = entity.HeartRate,
                Temperature = entity.Temperature,
                RespiratoryRate = entity.RespiratoryRate,
                Spo2 = entity.Spo2,
                IsAbnormal = entity.IsAbnormal
            };
        }
    }
}
