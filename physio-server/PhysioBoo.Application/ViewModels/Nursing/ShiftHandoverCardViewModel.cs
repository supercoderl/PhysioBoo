using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class ShiftHandoverCardViewModel
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string BedNumber { get; set; } = string.Empty;
        public string Situation { get; set; } = string.Empty;
        public string Background { get; set; } = string.Empty;
        public string Assessment { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public string OutgoingShift { get; set; } = string.Empty;
        public string IncomingShift { get; set; } = string.Empty;
        public bool Acknowledged { get; set; }
        public string? AcknowledgedBy { get; set; }

        public static ShiftHandoverCardViewModel FromEntity(HandoverCard entity, string? bedNumber)
        {
            return new ShiftHandoverCardViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                PatientName = entity.Patient?.Profile?.FullName ?? string.Empty,
                BedNumber = bedNumber ?? string.Empty,
                Situation = entity.Situation,
                Background = entity.Background,
                Assessment = entity.Assessment,
                Recommendation = entity.Recommendation,
                OutgoingShift = entity.OutgoingShift.ToString(),
                IncomingShift = entity.IncomingShift.ToString(),
                Acknowledged = entity.IsAcknowledged,
                AcknowledgedBy = entity.AcknowledgedByName
            };
        }
    }
}
