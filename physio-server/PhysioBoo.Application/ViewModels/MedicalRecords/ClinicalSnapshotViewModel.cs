using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class ClinicalSnapshotViewModel
    {
        public sealed class RecentLabAlert
        {
            public Guid LabOrderItemId { get; set; }
            public string TestName { get; set; } = string.Empty;
            public string ResultValue { get; set; } = string.Empty;
            public string? ResultUnit { get; set; }
            public string? AbnormalFlag { get; set; }
            public bool IsCritical { get; set; }
            public string CreatedAt { get; set; } = string.Empty;

            public static RecentLabAlert FromLab(LabOrderItem labItem)
            {
                return new RecentLabAlert
                {
                    LabOrderItemId = labItem.Id,
                    TestName = labItem.TestName,
                    ResultValue = labItem.ResultValue ?? string.Empty,
                    ResultUnit = labItem.ResultUnit,
                    AbnormalFlag = labItem.AbnormalFlag,
                    IsCritical = labItem.CritialFlag,
                    CreatedAt = TimeZoneHelper.ConvertDateTimeToString(labItem.CreatedAt, DateFormats.Iso8601)
                };
            }
        }

        public sealed class UpcomingAppointment
        {
            public Guid AppointmentId { get; set; }
            public string ScheduleAt { get; set; } = string.Empty;
            public string DoctorName { get; set; } = string.Empty;
            public string Department { get; set; } = string.Empty;
            public AppointmentStatus AppointmentStatus { get; set; }

            public static UpcomingAppointment FromAppointment(Appointment appointment)
            {
                return new UpcomingAppointment
                {
                    AppointmentId = appointment.Id,
                    ScheduleAt = TimeZoneHelper.ConvertDateTimeToString(appointment.ScheduledDate.ToDateTime(TimeOnly.MinValue), DateFormats.Iso8601),
                    DoctorName = appointment.Doctor?.User?.Profile?.FullName ?? string.Empty,
                    Department = appointment.Department?.Name ?? string.Empty,
                    AppointmentStatus = appointment.AppointmentStatus
                };
            }
        }

        public int ActiveDiagnosesCount { get; set; }
        public int ActiveMedicationsCount { get; set; }
        public int KnownAllergiesCount { get; set; }
        public int PendingOrdersCount { get; set; }
        public IReadOnlyList<RecentLabAlert> RecentLabAlerts { get; set; } = Array.Empty<RecentLabAlert>();
        public IReadOnlyList<UpcomingAppointment> UpcomingAppointments { get; set; } = Array.Empty<UpcomingAppointment>();
        public decimal OutstandingBalance { get; set; }
        public string Currency { get; set; } = string.Empty;

        public static ClinicalSnapshotViewModel FromEntity(
            int activeDiagnosesCount,
            int activeMedicationsCount,
            int knownAllergiesCount,
            int pendingOrdersCount,
            IReadOnlyList<RecentLabAlert> recentLabAlerts,
            IReadOnlyList<UpcomingAppointment> upcomingAppointments,
            decimal outstandingBalance,
            string currency
        )
        {
            return new ClinicalSnapshotViewModel
            {
                ActiveDiagnosesCount = activeDiagnosesCount,
                ActiveMedicationsCount = activeMedicationsCount,
                KnownAllergiesCount = knownAllergiesCount,
                PendingOrdersCount = pendingOrdersCount,
                RecentLabAlerts = recentLabAlerts,
                UpcomingAppointments = upcomingAppointments,
                OutstandingBalance = outstandingBalance,
                Currency = currency
            };
        }
    }
}
