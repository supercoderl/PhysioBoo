using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// A realistic mix of past and upcoming appointments. Each one lands on a free slot inside the doctor's working hours
    /// (never in their break, never twice for the same doctor or patient), after the patient registered, and its status
    /// matches its time: past visits are completed, cancelled or no-shows; upcoming ones are scheduled, confirmed or cancelled.
    /// </summary>
    internal sealed class AppointmentsModule : IDevDataModule
    {
        public const string ModuleKey = "appointments";

        private const int MaxDaysBack = 110;
        private const int MaxDaysAhead = 28;
        private const int AttemptsPerAppointment = 40;

        private static readonly string[] Complaints = { "Persistent lower back pain", "Knee pain when climbing stairs", "Neck stiffness after long desk work", "Shoulder pain and limited movement", "Recovery after a sprained ankle", "Headaches that return every week", "Follow-up after minor surgery", "Routine health check-up", "Muscle strain after exercise", "Numbness in the hands" };
        private static readonly string[] Diagnoses = { "Lumbar muscle strain", "Mild knee osteoarthritis", "Cervical spondylosis", "Rotator cuff tendinopathy", "Lateral ankle sprain, grade 1", "Tension-type headache", "Healthy; no abnormal findings", "Quadriceps strain", "Carpal tunnel syndrome" };
        private static readonly string[] TreatmentPlans = { "Six physiotherapy sessions over three weeks with a home exercise programme.", "Rest, ice and guided mobility exercises; review in two weeks.", "Manual therapy and posture correction; ergonomic advice given.", "Strengthening programme and anti-inflammatory advice.", "Continue the current plan; return if symptoms get worse." };
        private static readonly string[] CancelReasons = { "Patient has a schedule conflict", "Patient is feeling better", "Doctor unavailable, patient asked to rebook", "Patient is travelling" };
        private static readonly string[] PaymentMethods = { "Cash", "Card", "Bank Transfer" };

        public string Key => ModuleKey;

        public string Label => "Appointments";

        public string Description => "Past and upcoming visits on free slots inside each doctor's working hours.";

        public IReadOnlyList<string> DependsOn => new[] { PatientsModule.ModuleKey, SchedulesModule.ModuleKey, MasterDataModule.ModuleKey };

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.Appointments.IgnoreQueryFilters().AnyAsync(a => a.TenantId == context.TenantId && a.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            DateTime now = context.Now;
            DateOnly today = DateOnly.FromDateTime(now);

            List<AppointmentType> types = await context.Db.AppointmentTypes.Where(t => t.IsActive).ToListAsync(ct);
            if (types.Count == 0)
            {
                context.Warn("No appointment types exist, so no appointments were generated.");
                return;
            }

            Dictionary<Guid, List<DoctorSchedule>> schedulesByDoctor = (await context.Db.DoctorSchedules.IgnoreQueryFilters()
                    .Where(s => s.TenantId == context.TenantId && s.DeletedAt == null && s.IsAvailable)
                    .ToListAsync(ct))
                .GroupBy(s => s.DoctorId)
                .ToDictionary(g => g.Key, g => g.ToList());

            Dictionary<Guid, Doctor> doctors = (await context.Db.Doctors.IgnoreQueryFilters()
                    .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null && d.EmploymentStatus == EmploymentStatus.Active)
                    .ToListAsync(ct))
                .Where(d => schedulesByDoctor.ContainsKey(d.Id))
                .ToDictionary(d => d.Id);

            List<Patient> patients = await context.Db.Patients.IgnoreQueryFilters()
                .Where(p => p.TenantId == context.TenantId && p.DeletedAt == null)
                .ToListAsync(ct);

            if (doctors.Count == 0 || patients.Count == 0)
            {
                context.Warn("The tenant needs patients and doctors with working schedules before appointments can be generated.");
                return;
            }

            Dictionary<Guid, string> roomNumbers = await context.Db.Rooms.IgnoreQueryFilters()
                .Where(r => r.TenantId == context.TenantId && r.DeletedAt == null)
                .ToDictionaryAsync(r => r.Id, r => r.RoomNumber, ct);

            // Slots already taken by earlier appointments of this tenant, so a second run never double-books.
            var existing = await context.Db.Appointments.IgnoreQueryFilters()
                .Where(a => a.TenantId == context.TenantId && a.DeletedAt == null)
                .Select(a => new { a.DoctorId, a.PatientId, a.ScheduledDate, a.ScheduledTime })
                .ToListAsync(ct);
            HashSet<(Guid, DateOnly, TimeOnly)> doctorSlots = existing.Select(a => (a.DoctorId, a.ScheduledDate, a.ScheduledTime)).ToHashSet();
            HashSet<(Guid, DateOnly, TimeOnly)> patientSlots = existing.Select(a => (a.PatientId, a.ScheduledDate, a.ScheduledTime)).ToHashSet();
            Dictionary<(Guid, DateOnly), int> queueByDoctorDay = existing
                .GroupBy(a => (a.DoctorId, a.ScheduledDate))
                .ToDictionary(g => g.Key, g => g.Count());

            List<Guid> doctorIds = doctors.Keys.ToList();
            int numberBase = await context.Db.Appointments.IgnoreQueryFilters().CountAsync(a => a.TenantId == context.TenantId, ct);

            List<Appointment> appointments = new List<Appointment>(count);
            Dictionary<Guid, (DateOnly Last, int Visits)> visits = new();
            int skipped = 0;

            for (int i = 0; i < count; i++)
            {
                Appointment? appointment = TryBuild(context, now, today, numberBase + appointments.Count + 1, types, doctorIds, doctors, schedulesByDoctor, patients, roomNumbers, doctorSlots, patientSlots, queueByDoctorDay);
                if (appointment is null)
                {
                    skipped++;
                    continue;
                }

                appointments.Add(appointment);

                if (appointment.AppointmentStatus == AppointmentStatus.Completed)
                {
                    (DateOnly last, int n) = visits.GetValueOrDefault(appointment.PatientId);
                    visits[appointment.PatientId] = (appointment.ScheduledDate > last ? appointment.ScheduledDate : last, n + 1);
                }
            }

            // A patient's visit history follows from the completed appointments generated here.
            foreach (Patient patient in patients)
            {
                if (!visits.TryGetValue(patient.Id, out (DateOnly Last, int Visits) v)) continue;
                patient.SetLastVisitDate(v.Last.ToDateTime(TimeOnly.MinValue));
                patient.SetTotalVisits(patient.TotalVisits + v.Visits);
            }

            context.Db.Appointments.AddRange(appointments);
            await context.SaveAsync(ct);

            context.Count("appointments", appointments.Count);
            if (skipped > 0)
                context.Warn($"{skipped} appointment(s) were skipped because no free slot was found for them.");
        }

        private static Appointment? TryBuild(
            DevDataContext context,
            DateTime now,
            DateOnly today,
            int number,
            IReadOnlyList<AppointmentType> types,
            IReadOnlyList<Guid> doctorIds,
            IReadOnlyDictionary<Guid, Doctor> doctors,
            IReadOnlyDictionary<Guid, List<DoctorSchedule>> schedulesByDoctor,
            IReadOnlyList<Patient> patients,
            IReadOnlyDictionary<Guid, string> roomNumbers,
            ISet<(Guid, DateOnly, TimeOnly)> doctorSlots,
            ISet<(Guid, DateOnly, TimeOnly)> patientSlots,
            IDictionary<(Guid, DateOnly), int> queueByDoctorDay)
        {
            DevDataFaker faker = context.Faker;

            for (int attempt = 0; attempt < AttemptsPerAppointment; attempt++)
            {
                Patient patient = faker.Pick(patients);
                Guid doctorId = doctors.ContainsKey(patient.PrimaryDoctorId) && faker.Chance(0.6) ? patient.PrimaryDoctorId : faker.Pick(doctorIds);
                Doctor doctor = doctors[doctorId];

                // 70% past, 30% today or later.
                int offset = faker.Chance(0.7) ? -faker.Between(1, MaxDaysBack) : faker.Between(0, MaxDaysAhead);
                DateOnly date = today.AddDays(offset);
                if (date < patient.RegistrationDate) continue;

                DoctorSchedule? schedule = schedulesByDoctor[doctorId].FirstOrDefault(s =>
                    s.DayOfWeek == (int)date.DayOfWeek && DateOnly.FromDateTime(s.EffectiveFrom) <= date
                    && (s.EffectiveTo is null || DateOnly.FromDateTime(s.EffectiveTo.Value) >= date));
                if (schedule is null) continue;

                List<TimeOnly> slots = FreeSlots(schedule)
                    .Where(t => !doctorSlots.Contains((doctorId, date, t)) && !patientSlots.Contains((patient.Id, date, t)))
                    .ToList();
                if (slots.Count == 0) continue;

                TimeOnly time = faker.Pick(slots);
                doctorSlots.Add((doctorId, date, time));
                patientSlots.Add((patient.Id, date, time));
                queueByDoctorDay[(doctorId, date)] = (queueByDoctorDay.TryGetValue((doctorId, date), out int queued) ? queued : 0) + 1;

                return Build(context, now, number, doctor, schedule, patient, faker.Pick(types), date, time, queueByDoctorDay[(doctorId, date)], roomNumbers);
            }

            return null;
        }

        /// <summary>Start times of the schedule's slots that fit the working hours and avoid the break.</summary>
        private static IEnumerable<TimeOnly> FreeSlots(DoctorSchedule schedule)
        {
            int minutes = Math.Max(schedule.SlotDuration, 10);

            for (TimeOnly start = schedule.StartTime; start.AddMinutes(minutes) <= schedule.EndTime && start.AddMinutes(minutes) > start; start = start.AddMinutes(minutes))
            {
                TimeOnly end = start.AddMinutes(minutes);
                bool inBreak = schedule.BreakStartTime is not null && schedule.BreakEndTime is not null
                    && start < schedule.BreakEndTime && end > schedule.BreakStartTime;
                if (!inBreak) yield return start;
            }
        }

        private static Appointment Build(
            DevDataContext context,
            DateTime now,
            int number,
            Doctor doctor,
            DoctorSchedule schedule,
            Patient patient,
            AppointmentType type,
            DateOnly date,
            TimeOnly time,
            int queueNumber,
            IReadOnlyDictionary<Guid, string> roomNumbers)
        {
            DevDataFaker faker = context.Faker;
            int minutes = Math.Max(schedule.SlotDuration, 10);
            TimeOnly endTime = time.AddMinutes(minutes);
            DateTime scheduledAt = date.ToDateTime(time);
            bool isPast = scheduledAt < now;
            string complaint = faker.Pick(Complaints);
            double roll = faker.Between(0, 9999) / 10000.0;

            AppointmentStatus status = isPast
                ? roll < 0.75 ? AppointmentStatus.Completed : roll < 0.88 ? AppointmentStatus.Cancelled : AppointmentStatus.NoShow
                : roll < 0.35 ? AppointmentStatus.Scheduled : roll < 0.93 ? AppointmentStatus.Confirmed : AppointmentStatus.Cancelled;

            Appointment appointment = new Appointment(
                Guid.NewGuid(),
                $"APT-{context.TenantCode}-{number:D5}",
                patient.Id,
                doctor.Id,
                schedule.HospitalId,
                schedule.DepartmentId,
                type.Id,
                date,
                time,
                endTime,
                null,
                null,
                minutes,
                complaint,
                null,
                complaint,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                doctor.RoomId is Guid roomId && roomNumbers.TryGetValue(roomId, out string? roomNumber) ? roomNumber : null,
                queueNumber,
                0,
                0,
                null,
                null,
                null,
                null,
                null);
            appointment.SetTenantId(context.TenantId);
            appointment.SetConsultationFee(doctor.ConsultationFeeMin);
            appointment.SetTotalAmount(doctor.ConsultationFeeMin);
            appointment.SetPriority(type.IsEmergency ? Priority.High : Priority.Normal);

            // Booked one to two weeks ahead; upcoming ones were booked recently.
            DateTime createdAt = isPast ? scheduledAt.AddDays(-faker.Between(1, 14)) : now.AddDays(-faker.Between(0, 10)).AddMinutes(-faker.Between(0, 600));
            appointment.SetCreatedAt(createdAt > now ? now : createdAt);

            appointment.SetAppointmentStatus(status);

            switch (status)
            {
                case AppointmentStatus.Completed:
                    TimeOnly actualStart = time.AddMinutes(faker.Between(0, 10));
                    appointment.SetActualStartTime(actualStart);
                    appointment.SetActualEndTime(actualStart.AddMinutes(Math.Max(minutes - faker.Between(0, 8), 5)));
                    appointment.SetDiagnosis(faker.Pick(Diagnoses));
                    appointment.SetTreatmentPlan(faker.Pick(TreatmentPlans));
                    appointment.SetPostAppointmentNotes("Patient tolerated the session well.");
                    if (faker.Chance(0.4))
                    {
                        appointment.SetFollowUpDate(date.AddDays(faker.Between(7, 28)));
                        appointment.SetFollowUpInstructions("Return for a progress review.");
                    }

                    bool paid = faker.Chance(0.88);
                    appointment.SetPaymentStatus(paid ? PaymentStatus.Paid : PaymentStatus.Pending);
                    if (paid) appointment.SetPaymentMethod(faker.Pick(PaymentMethods));
                    if (faker.Chance(0.6))
                    {
                        appointment.SetPatientSatisfactionRating(faker.Between(3, 5));
                        appointment.SetPatientFeedback(null);
                    }
                    break;

                case AppointmentStatus.Cancelled:
                    appointment.SetCancellationReason(faker.Pick(CancelReasons));
                    appointment.SetCancelledBy(doctor.Id);
                    DateTime cancelledAt = scheduledAt.AddHours(-faker.Between(2, 48));
                    appointment.SetCancelledAt(cancelledAt > now ? now : cancelledAt < appointment.CreatedAt ? appointment.CreatedAt : cancelledAt);
                    appointment.SetPaymentStatus(PaymentStatus.Cancelled);
                    break;

                case AppointmentStatus.NoShow:
                    appointment.SetPaymentStatus(PaymentStatus.Pending);
                    break;
            }

            return appointment;
        }
    }
}
