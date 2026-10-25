using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Weekly working hours: five regular days per doctor at the doctor's own department and branch, one lunch break,
    /// effective from four months ago so historical appointments fall inside working hours. Every doctor of the tenant
    /// that has no schedule yet gets one; doctors that already have a schedule are left alone.
    /// </summary>
    internal sealed class SchedulesModule : IDevDataModule
    {
        public const string ModuleKey = "schedules";

        /// <summary>How far back schedules are effective. Appointments are generated no further back than this.</summary>
        public const int EffectiveMonthsBack = 4;

        private sealed record Shift(TimeOnly Start, TimeOnly End, TimeOnly BreakStart, TimeOnly BreakEnd);

        private static readonly Shift[] Shifts =
        {
            new(new TimeOnly(8, 0), new TimeOnly(17, 0), new TimeOnly(12, 0), new TimeOnly(13, 0)),
            new(new TimeOnly(7, 30), new TimeOnly(16, 0), new TimeOnly(11, 30), new TimeOnly(12, 30)),
            new(new TimeOnly(10, 0), new TimeOnly(19, 0), new TimeOnly(14, 0), new TimeOnly(15, 0)),
        };

        // Monday to Saturday (DoctorSchedule.DayOfWeek: 0 = Sunday); each doctor works five of the six.
        private static readonly int[] WorkingDays = { 1, 2, 3, 4, 5, 6 };

        public string Key => ModuleKey;

        public string Label => "Doctor schedules";

        public string Description => "Weekly working hours for every doctor, at their own department and branch.";

        public IReadOnlyList<string> DependsOn => new[] { ProvidersModule.ModuleKey };

        /// <summary>True when every doctor of the tenant already has at least one schedule row.</summary>
        public async Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct)
        {
            bool anyDoctor = await context.Db.Doctors.IgnoreQueryFilters()
                .AnyAsync(d => d.TenantId == context.TenantId && d.DeletedAt == null, ct);
            if (!anyDoctor) return false;

            return !await context.Db.Doctors.IgnoreQueryFilters()
                .AnyAsync(d => d.TenantId == context.TenantId && d.DeletedAt == null && d.DepartmentId != null
                    && !context.Db.DoctorSchedules.IgnoreQueryFilters().Any(s => s.DoctorId == d.Id && s.DeletedAt == null), ct);
        }

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Doctor> doctors = await context.Db.Doctors.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null && d.DepartmentId != null
                    && !context.Db.DoctorSchedules.IgnoreQueryFilters().Any(s => s.DoctorId == d.Id && s.DeletedAt == null))
                .ToListAsync(ct);

            if (doctors.Count == 0)
            {
                context.Warn("No doctor without a schedule was found, so no schedules were generated.");
                return;
            }

            Dictionary<Guid, Department> departments = await context.Db.Departments.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null)
                .ToDictionaryAsync(d => d.Id, ct);

            DateTime effectiveFrom = context.Now.Date.AddMonths(-EffectiveMonthsBack);
            List<DoctorSchedule> schedules = new List<DoctorSchedule>(doctors.Count * 5);

            for (int i = 0; i < doctors.Count; i++)
            {
                Doctor doctor = doctors[i];
                Department department = departments[doctor.DepartmentId!.Value];
                Shift shift = Shifts[i % Shifts.Length];
                int offDay = WorkingDays[i % WorkingDays.Length];

                foreach (int day in WorkingDays.Where(d => d != offDay))
                {
                    // Saturday is a half day.
                    bool halfDay = day == 6;
                    DoctorSchedule schedule = new DoctorSchedule(
                        Guid.NewGuid(),
                        doctor.Id,
                        department.HospitalId,
                        department.Id,
                        day,
                        shift.Start,
                        halfDay ? shift.BreakStart : shift.End,
                        halfDay ? null : shift.BreakStart,
                        halfDay ? null : shift.BreakEnd,
                        ScheduleType.Regular,
                        null,
                        doctor.ConsultationFeeMin,
                        null);
                    schedule.SetTenantId(context.TenantId);
                    schedule.SetSlotDuration(doctor.ConsultationDuration);
                    schedule.SetEffectiveFrom(effectiveFrom);
                    schedules.Add(schedule);
                }
            }

            context.Db.DoctorSchedules.AddRange(schedules);
            await context.SaveAsync(ct);
            context.Count("schedules", schedules.Count);
        }
    }
}
