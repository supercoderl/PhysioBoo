using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed class SurgeryAlertViewModel
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SuggestedAction { get; set; } = string.Empty;
        public string? PatientName { get; set; }
        public string? SurgeryNumber { get; set; }
        public bool Acknowledged { get; set; }
        public DateTime RaisedAt { get; set; }

        public static SurgeryAlertViewModel FromEntity(SurgeryAlert entity)
        {
            return new SurgeryAlertViewModel
            {
                Id = entity.Id,
                Type = entity.Type.ToString(),
                Severity = entity.Severity.ToString(),
                Description = entity.Description,
                SuggestedAction = entity.SuggestedAction,
                PatientName = entity.Patient?.Profile?.FullName,
                SurgeryNumber = entity.SurgeryCase?.SurgeryNumber,
                Acknowledged = entity.IsAcknowledged,
                RaisedAt = entity.RaisedAt
            };
        }
    }
}
