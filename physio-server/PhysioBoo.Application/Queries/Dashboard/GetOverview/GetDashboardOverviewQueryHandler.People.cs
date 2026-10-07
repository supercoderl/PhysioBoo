using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dashboard;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    public sealed partial class GetDashboardOverviewQueryHandler
    {
        private const int FirstClinicHour = 8;
        private const int LastClinicHour = 19;
        private const int RecentEventCount = 8;

        #region Appointments
        private async Task<AppointmentFlowSummaryViewModel> GetAppointmentFlowAsync(DateOnly day, CancellationToken ct)
        {
            var appointments = await _appointmentRepository
                .GetAllNoTracking(a => a.ScheduledDate == day && a.AppointmentStatus != AppointmentStatus.Cancelled && a.AppointmentStatus != AppointmentStatus.Rescheduled)
                .Select(a => new { a.AppointmentStatus, a.ScheduledTime })
                .ToListAsync(ct);

            List<DoctorSchedule> schedules = await GetWorkingSchedulesAsync(day, ct);

            // Capacity per clock hour from the doctors' schedules (slots x patients per slot, minus breaks).
            Dictionary<int, double> capacity = Enumerable.Range(0, 24).ToDictionary(h => h, h => schedules.Sum(s => SlotsInHour(s, h)));
            int totalCapacity = (int)Math.Round(capacity.Values.Sum());

            List<AppointmentFlowHourlySlotViewModel> hourly = Enumerable.Range(FirstClinicHour, LastClinicHour - FirstClinicHour + 1)
                .Select(h =>
                {
                    int booked = appointments.Count(a => a.ScheduledTime.Hour == h);
                    int pct = capacity[h] <= 0 ? (booked > 0 ? 100 : 0) : (int)Math.Min(100, Math.Round(booked * 100 / capacity[h]));
                    string label = h == 12 ? "12PM" : h < 12 ? $"{h}AM" : $"{h - 12}PM";
                    return new AppointmentFlowHourlySlotViewModel(label, pct);
                })
                .ToList();

            return new AppointmentFlowSummaryViewModel(
                appointments.Count,
                appointments.Count(a => a.AppointmentStatus is AppointmentStatus.Confirmed or AppointmentStatus.CheckedIn
                                         or AppointmentStatus.InProgress or AppointmentStatus.Completed),
                appointments.Count(a => a.AppointmentStatus == AppointmentStatus.Scheduled),
                appointments.Count(a => a.AppointmentStatus == AppointmentStatus.NoShow),
                Math.Max(0, totalCapacity - appointments.Count),
                hourly
            );
        }

        /// <summary>Schedules in effect on the day, for doctors who are not on approved leave.</summary>
        private async Task<List<DoctorSchedule>> GetWorkingSchedulesAsync(DateOnly day, CancellationToken ct)
        {
            DateTime dayStart = day.ToDateTime(TimeOnly.MinValue);
            DateTime dayEnd = dayStart.AddDays(1);
            int weekday = (int)day.DayOfWeek;

            List<Guid> onLeave = await _doctorLeaveRepository
                .GetAllNoTracking(l => l.Status == LeaveStatus.Approved && l.StartDate <= day && l.EndDate >= day)
                .Select(l => l.DoctorId)
                .ToListAsync(ct);

            return await _doctorScheduleRepository
                .GetAllNoTracking(s => s.DayOfWeek == weekday && s.IsAvailable &&
                                       s.EffectiveFrom < dayEnd && (s.EffectiveTo == null || s.EffectiveTo >= dayStart) &&
                                       !onLeave.Contains(s.DoctorId))
                .ToListAsync(ct);
        }

        private static double SlotsInHour(DoctorSchedule s, int hour)
        {
            if (s.SlotDuration <= 0) return 0;

            double Overlap(TimeOnly from, TimeOnly to)
            {
                double start = Math.Max(from.ToTimeSpan().TotalMinutes, hour * 60);
                double end = Math.Min(to.ToTimeSpan().TotalMinutes, (hour + 1) * 60);
                return Math.Max(0, end - start);
            }

            double minutes = Overlap(s.StartTime, s.EndTime);
            if (s.BreakStartTime.HasValue && s.BreakEndTime.HasValue)
                minutes -= Overlap(s.BreakStartTime.Value, s.BreakEndTime.Value);

            return Math.Max(0, minutes) / s.SlotDuration * Math.Max(1, s.MaxPatientsPerSlot);
        }
        #endregion

        #region Staff
        private async Task<StaffDutySummaryViewModel> GetStaffDutyAsync(DateOnly day, string shiftLabel, CancellationToken ct)
        {
            int doctorsTotal = await _doctorRepository.GetAllNoTracking().CountAsync(ct);
            int doctorsOnDuty = (await GetWorkingSchedulesAsync(day, ct)).Select(s => s.DoctorId).Distinct().Count();

            // Staff are "on duty" when Active; OnLeave, Suspended and Inactive count towards the total only.
            var staff = await _hospitalStaffRepository
                .GetAllNoTracking(s => s.EmploymentStatus != EmploymentStatus.Terminated)
                .Select(s => new { s.StaffType, s.EmploymentStatus })
                .ToListAsync(ct);

            StaffGroupDutyViewModel Group(params StaffType[] types)
            {
                var members = staff.Where(s => types.Contains(s.StaffType)).ToList();
                return new StaffGroupDutyViewModel(members.Count(m => m.EmploymentStatus == EmploymentStatus.Active), members.Count);
            }

            StaffGroupDutyViewModel doctors = new(Math.Min(doctorsOnDuty, doctorsTotal), doctorsTotal);
            StaffGroupDutyViewModel nurses = Group(StaffType.Nurse);
            StaffGroupDutyViewModel technicians = Group(StaffType.Technician, StaffType.Laboratory, StaffType.Radiology, StaffType.Pharmacist, StaffType.Physiotherapy);
            StaffGroupDutyViewModel admin = Group(StaffType.Admin, StaffType.Receptionist);

            int onDuty = doctors.OnDuty + nurses.OnDuty + technicians.OnDuty + admin.OnDuty;
            int total = doctors.Total + nurses.Total + technicians.Total + admin.Total;

            return new StaffDutySummaryViewModel(shiftLabel, (int)Math.Round(Pct(onDuty, total)), doctors, nurses, technicians, admin);
        }
        #endregion

        #region Recent events
        private async Task<List<DashboardEventViewModel>> GetRecentEventsAsync(DateTime dayStart, DateTime dayEnd, CancellationToken ct)
        {
            List<(DateTime At, DashboardEventViewModel Event)> events = new();
            DateOnly day = DateOnly.FromDateTime(dayStart);

            var admissions = await _admissionRepository
                .GetAllNoTracking(a => a.AdmittedAt >= dayStart && a.AdmittedAt < dayEnd && a.Status != AdmissionRecordStatus.Cancelled)
                .OrderByDescending(a => a.AdmittedAt).Take(RecentEventCount)
                .Select(a => new { a.Id, a.AdmittedAt, a.Patient!.PatientNumber, Department = a.Department!.Name })
                .ToListAsync(ct);
            events.AddRange(admissions.Select(a => (a.AdmittedAt, Event($"adm-{a.Id}", $"Patient {a.PatientNumber} admitted to {a.Department}", a.AdmittedAt, "admission"))));

            var discharges = await _admissionRepository
                .GetAllNoTracking(a => a.DischargedAt >= dayStart && a.DischargedAt < dayEnd)
                .OrderByDescending(a => a.DischargedAt).Take(RecentEventCount)
                .Select(a => new { a.Id, DischargedAt = a.DischargedAt!.Value, a.Patient!.PatientNumber, Department = a.Department!.Name })
                .ToListAsync(ct);
            events.AddRange(discharges.Select(a => (a.DischargedAt, Event($"dis-{a.Id}", $"Patient {a.PatientNumber} discharged — {a.Department}", a.DischargedAt, "discharge"))));

            var payments = await _paymentRepository
                .GetAllNoTracking(p => p.PaymentDate == day && p.Status == PaymentStatus.Paid)
                .OrderByDescending(p => p.PaymentTime).Take(RecentEventCount)
                .Select(p => new { p.Id, p.PaymentNumber, p.Amount, p.PaymentTime })
                .ToListAsync(ct);
            events.AddRange(payments.Select(p =>
            {
                DateTime at = day.ToDateTime(p.PaymentTime);
                return (at, Event($"pay-{p.Id}", $"Payment {p.PaymentNumber} received ({p.Amount:N0})", at, "billing"));
            }));

            var surgeries = await _surgeryCaseRepository
                .GetAllNoTracking(c => c.Timeline.Any(t => t.Stage == SurgeryTimelineStage.SurgeryStarted && t.OccurredAt >= dayStart && t.OccurredAt < dayEnd))
                .Select(c => new
                {
                    c.Id,
                    c.Procedure,
                    Room = c.OperatingRoom!.RoomNumber,
                    StartedAt = c.Timeline.Where(t => t.Stage == SurgeryTimelineStage.SurgeryStarted).Max(t => t.OccurredAt)
                })
                .Take(RecentEventCount)
                .ToListAsync(ct);
            events.AddRange(surgeries.Select(s => (s.StartedAt, Event($"sur-{s.Id}", $"{s.Room} {s.Procedure} started", s.StartedAt, "surgery"))));

            var labResults = await _labOrderItemRepository
                .GetAllNoTracking(i => i.ReleasedAt >= dayStart && i.ReleasedAt < dayEnd)
                .OrderByDescending(i => i.ReleasedAt).Take(RecentEventCount)
                .Select(i => new { i.Id, i.TestName, ReleasedAt = i.ReleasedAt!.Value, i.CritialFlag, i.LabOrder!.OrderNumber })
                .ToListAsync(ct);
            events.AddRange(labResults.Select(i => (i.ReleasedAt, Event($"lab-{i.Id}",
                $"{(i.CritialFlag ? "Critical " : "")}{i.TestName} result released — {i.OrderNumber}", i.ReleasedAt, "lab"))));

            var stock = await _inventoryAlertRepository
                .GetAllNoTracking(a => a.CreatedAt >= dayStart && a.CreatedAt < dayEnd)
                .OrderByDescending(a => a.CreatedAt).Take(RecentEventCount)
                .Select(a => new { a.Id, a.Message, a.CreatedAt })
                .ToListAsync(ct);
            events.AddRange(stock.Select(a => (a.CreatedAt, Event($"inv-{a.Id}", a.Message, a.CreatedAt, "pharmacy"))));

            return events.OrderByDescending(e => e.At).Take(RecentEventCount).Select(e => e.Event).ToList();
        }

        private static DashboardEventViewModel Event(string id, string text, DateTime at, string category) =>
            new(id, text, Time(at), category);
        #endregion
    }
}
