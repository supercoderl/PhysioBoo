using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.Appointments
{
    public sealed class AppointmentViewModel
    {
        public Guid Id { get; set; }
        public string AppointmentNumber { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public string PatientMRN { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public DateOnly ScheduledDate { get; set; }
        public TimeOnly ScheduledTime { get; set; }
        public TimeOnly? ScheduledEndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ChiefComplaint { get; set; }
        public string? AppointmentTypeName { get; set; }
        public int? DurationMinutes { get; set; }

        public static AppointmentViewModel FromEntity(Appointment appointment)
        {
            return new AppointmentViewModel
            {
                Id = appointment.Id,
                AppointmentNumber = appointment.AppointmentNumber,
                PatientId = appointment.PatientId,
                PatientName = appointment.Patient?.Profile?.FullName ?? string.Empty,
                PatientPhone = appointment.Patient?.Profile?.Phone ?? appointment.Patient?.User?.Phone ?? string.Empty,
                PatientMRN = appointment.Patient?.PatientNumber ?? string.Empty,
                DoctorId = appointment.DoctorId,
                DoctorName = appointment.Doctor?.User?.Profile?.FullName ?? string.Empty,
                ScheduledDate = appointment.ScheduledDate,
                ScheduledTime = appointment.ScheduledTime,
                ScheduledEndTime = appointment.ScheduledEndTime,
                Status = appointment.AppointmentStatus.ToString(),
                ChiefComplaint = appointment.ChiefComplaint,
                AppointmentTypeName = appointment.AppointmentType?.Name,
                DurationMinutes = appointment.DurationMinutes
            };
        }
    }
}
