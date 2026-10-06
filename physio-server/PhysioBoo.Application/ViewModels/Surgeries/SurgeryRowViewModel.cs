using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Surgeries
{
    // "Delayed" is derived: a case still waiting to start more than 15 minutes after its scheduled start.
    public static class SurgeryStatusText
    {
        private static readonly TimeSpan Grace = TimeSpan.FromMinutes(15);

        public static bool IsDelayed(SurgeryCase surgery, DateTime now)
        {
            return surgery.Status is SurgeryStatus.Scheduled or SurgeryStatus.PatientArrived or SurgeryStatus.PreOpReady
                && surgery.ScheduledStart + Grace < now;
        }

        public static string Of(SurgeryCase surgery, DateTime now)
        {
            return IsDelayed(surgery, now) ? "Delayed" : surgery.Status.ToString();
        }
    }

    public class SurgeryRowViewModel
    {
        public Guid Id { get; set; }
        public string SurgeryNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Mrn { get; set; } = string.Empty;
        public string Procedure { get; set; } = string.Empty;
        public string SurgeryType { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string PrimarySurgeon { get; set; } = string.Empty;
        public string? AssistantSurgeon { get; set; }
        public string? Anesthesiologist { get; set; }
        public string OperatingRoomNumber { get; set; } = string.Empty;
        public DateTime ScheduledStart { get; set; }
        public int EstimatedDurationMinutes { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        // Needs Patient -> Profile, Department, OperatingRoom and Team -> StaffUser -> Profile loaded.
        public static SurgeryRowViewModel FromEntity(SurgeryCase entity, DateTime now)
        {
            SurgeryRowViewModel row = new();
            Populate(row, entity, now);
            return row;
        }

        protected static void Populate(SurgeryRowViewModel row, SurgeryCase entity, DateTime now)
        {
            row.Id = entity.Id;
            row.SurgeryNumber = entity.SurgeryNumber;
            row.PatientName = entity.Patient?.Profile?.FullName ?? string.Empty;
            row.Mrn = entity.Patient?.PatientNumber ?? string.Empty;
            row.Procedure = entity.Procedure;
            row.SurgeryType = entity.SurgeryType;
            row.Department = entity.Department?.Name ?? string.Empty;
            row.PrimarySurgeon = StaffName(entity, SurgicalTeamRole.PrimarySurgeon) ?? string.Empty;
            row.AssistantSurgeon = StaffName(entity, SurgicalTeamRole.AssistantSurgeon);
            row.Anesthesiologist = StaffName(entity, SurgicalTeamRole.Anesthesiologist);
            row.OperatingRoomNumber = entity.OperatingRoom?.RoomNumber ?? string.Empty;
            row.ScheduledStart = entity.ScheduledStart;
            row.EstimatedDurationMinutes = entity.EstimatedDurationMinutes;
            row.Priority = entity.Priority.ToString();
            row.Status = SurgeryStatusText.Of(entity, now);
        }

        private static string? StaffName(SurgeryCase entity, SurgicalTeamRole role)
        {
            return entity.Team.FirstOrDefault(t => t.Role == role)?.StaffUser?.Profile?.FullName;
        }
    }
}
