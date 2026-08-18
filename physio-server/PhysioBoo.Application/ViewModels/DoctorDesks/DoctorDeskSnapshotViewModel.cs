using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.DoctorDesks
{
    public sealed class DoctorDeskSnapshotViewModel
    {
        public sealed class DoctorContextViewModel
        {
            public string DoctorName { get; set; } = string.Empty;
            public string AvatarUrl { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public string Room { get; set; } = string.Empty;
            public string Shift { get; set; } = string.Empty;
            public bool IsOnline { get; set; }
        }

        public sealed class QueuePatientViewModel
        {
            public Guid Id { get; set; }
            public Guid AppointmentId { get; set; }
            public string QueueNumber { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public int Age { get; set; }
            public string Gender { get; set; } = string.Empty;
            public string Reason { get; set; } = string.Empty;
            public string AppointmentTime { get; set; } = string.Empty;
            public string ArrivalTime { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string Priority { get; set; } = string.Empty;
            public List<string> Allergies { get; set; } = new();
        }

        public DoctorContextViewModel Context { get; set; } = new();
        public List<QueuePatientViewModel> Patients { get; set; } = new();

        public static DoctorDeskSnapshotViewModel FromEntity(Doctor doctor, List<Appointment> appointments)
        {
            return new DoctorDeskSnapshotViewModel
            {
                Context = new DoctorContextViewModel
                {
                    DoctorName = doctor.User?.Profile?.FullName ?? "",
                    AvatarUrl = doctor.User?.ProfilePicture ?? "",
                    Department = doctor.Department?.Name ?? string.Empty,
                    Room = doctor.Room?.RoomNumber ?? string.Empty,
                    Shift = "Morning Shift",
                    IsOnline = true
                },
                Patients = appointments.Select(a => new QueuePatientViewModel
                {
                    Id = a.Id,
                    AppointmentId = a.Id,
                    QueueNumber = a.AppointmentNumber,
                    Name = a.Patient?.Profile!.FullName ?? string.Empty,
                    Age = AgeHelper.CalculateAge(a.Patient?.Profile!.DateOfBirth ?? DateOnly.FromDateTime(new DateTime(1900, 07, 05))),
                    Gender = a.Patient?.Profile!.Gender.ToString() ?? Gender.Other.ToString(),
                    Reason = a.ChiefComplaint ?? string.Empty,
                    AppointmentTime = a.ScheduledTime.ToString("HH:mm"),
                    ArrivalTime = a.CheckedInAt?.ToString("HH:mm") ?? string.Empty,
                    Status = a.AppointmentStatus.ToString().ToLower(),
                    Priority = (a.AppointmentType?.IsEmergency ?? false) ? "urgent" : "normal",
                    Allergies = a.Patient?.Allergies.Select(al => al.AllergenName).ToList() ?? new List<string>()
                }).ToList()
            };
        }
    }
}
