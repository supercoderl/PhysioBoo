using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentAlertViewModel
    {
        // Alert types the treatment sheet understands. FallRisk and Emergency are nursing-only.
        public static readonly ClinicalAlertType[] SupportedTypes =
        {
            ClinicalAlertType.Allergy,
            ClinicalAlertType.DrugInteraction,
            ClinicalAlertType.AbnormalLab,
            ClinicalAlertType.AbnormalVitals,
            ClinicalAlertType.CriticalVitals,
            ClinicalAlertType.InfectionControl,
            ClinicalAlertType.Isolation,
            ClinicalAlertType.PendingCriticalOrder
        };

        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;        // Allergy | DrugInteraction | AbnormalLab | CriticalVitals | ...
        public string Severity { get; set; } = string.Empty;    // Information | Warning | High | Critical
        public string Message { get; set; } = string.Empty;
        public DateTime RaisedAt { get; set; }
        public bool Acknowledged { get; set; }

        public static TreatmentAlertViewModel FromEntity(ClinicalAlert entity)
        {
            return new TreatmentAlertViewModel
            {
                Id = entity.Id,
                Type = entity.Type == ClinicalAlertType.AbnormalVitals ? "CriticalVitals" : entity.Type.ToString(),
                Severity = entity.Severity switch
                {
                    ClinicalAlertSeverity.Low => "Information",
                    ClinicalAlertSeverity.Medium => "Warning",
                    _ => entity.Severity.ToString()
                },
                Message = entity.Message,
                RaisedAt = entity.RaisedAt,
                Acknowledged = entity.IsAcknowledged
            };
        }
    }
}
