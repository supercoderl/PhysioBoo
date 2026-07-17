using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class EncounterViewModel
    {
        public Guid AppointmentId { get; set; }
        public string AppointmentNumber { get; set; } = string.Empty;
        public string ScheduledAt { get; set; } = string.Empty;
        public string? EndedAt { get; set; }
        public AppointmentStatus AppointmentStatus { get; set; }
        public string ConsultationType { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? AppointmentTypeName { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? Diagnosis { get; set; }
        public string? TreatmentPlan { get; set; }
        public string? FollowUpDate { get; set; }
        public int? DurationMinutes { get; set; }
        public string? RoomNumber { get; set; }
        public decimal TotalAmount { get; set; }

        public static EncounterViewModel FromEntity(Appointment appointment)
        {
            return new EncounterViewModel
            {
                AppointmentId = appointment.Id,
                AppointmentNumber = appointment.AppointmentNumber,
                ScheduledAt = TimeZoneHelper.ConvertDateTimeToString(appointment.ScheduledDate.ToDateTime(appointment.ScheduledTime), DateFormats.IsoDate),
                EndedAt = appointment.ScheduledEndTime.HasValue ? TimeZoneHelper.ConvertDateTimeToString(appointment.ScheduledDate.ToDateTime(appointment.ScheduledEndTime.Value), DateFormats.IsoDate) : null,
                AppointmentStatus = appointment.AppointmentStatus,
                ConsultationType = appointment.ConsultationType.ToString(),
                DoctorName = appointment.Doctor?.User?.Profile?.FullName ?? string.Empty,
                DepartmentName = appointment.Department?.Name ?? string.Empty,
                AppointmentTypeName = appointment.AppointmentType?.Name ?? string.Empty,
                ChiefComplaint = appointment.ChiefComplaint,
                Diagnosis = appointment.Diagnosis,
                TreatmentPlan = appointment.TreatmentPlan,
                FollowUpDate = TimeZoneHelper.ConvertDateTimeToString(appointment.FollowUpDate, DateFormats.IsoDate),
                DurationMinutes = appointment.DurationMinutes,
                RoomNumber = appointment.RoomNumber,
                TotalAmount = appointment.TotalAmount
            };
        }
    }
}
