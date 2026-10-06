using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class NursingAlertViewModel
    {
        // Alert types the nursing dashboard understands. Others (drug interaction, abnormal lab, pending
        // critical order) belong to the treatment sheet and are not listed here.
        public static readonly ClinicalAlertType[] SupportedTypes =
        {
            ClinicalAlertType.FallRisk,
            ClinicalAlertType.Isolation,
            ClinicalAlertType.Emergency,
            ClinicalAlertType.Allergy,
            ClinicalAlertType.AbnormalVitals,
            ClinicalAlertType.CriticalVitals,
            ClinicalAlertType.InfectionControl
        };

        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string BedNumber { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;        // FallRisk | Isolation | Emergency | Allergy | AbnormalVitals
        public string Severity { get; set; } = string.Empty;    // Critical | High | Medium | Low
        public string Message { get; set; } = string.Empty;
        public DateTime RaisedAt { get; set; }
        public bool Acknowledged { get; set; }

        public static NursingAlertViewModel FromEntity(ClinicalAlert entity, string? bedNumber)
        {
            return new NursingAlertViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                PatientName = entity.Patient?.Profile?.FullName ?? string.Empty,
                BedNumber = bedNumber ?? string.Empty,
                Type = entity.Type switch
                {
                    ClinicalAlertType.CriticalVitals => "AbnormalVitals",
                    ClinicalAlertType.InfectionControl => "Isolation",
                    _ => entity.Type.ToString()
                },
                Severity = entity.Severity.ToString(),
                Message = entity.Message,
                RaisedAt = entity.RaisedAt,
                Acknowledged = entity.IsAcknowledged
            };
        }
    }
}
