using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Admissions;
using PhysioBoo.Application.Queries.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.GenerateHandover
{
    public sealed class GenerateHandoverCommandHandler : CommandHandlerBase, IRequestHandler<GenerateHandoverCommand>
    {
        // Doses due within this window are listed for the incoming nurse.
        private static readonly TimeSpan DoseLookAhead = TimeSpan.FromHours(4);

        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly IHandoverCardRepository _handoverCardRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IVitalSignRepository _vitalSignRepository;
        private readonly INursingTaskRepository _taskRepository;
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IUser _user;

        public GenerateHandoverCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INursingAssignmentRepository assignmentRepository,
            IHandoverCardRepository handoverCardRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IVitalSignRepository vitalSignRepository,
            INursingTaskRepository taskRepository,
            IMedicationAdministrationRepository medicationRepository,
            IClinicalAlertRepository alertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _assignmentRepository = assignmentRepository;
            _handoverCardRepository = handoverCardRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _vitalSignRepository = vitalSignRepository;
            _taskRepository = taskRepository;
            _medicationRepository = medicationRepository;
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task Handle(GenerateHandoverCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            ShiftCode outgoing = request.OutgoingShift;
            ShiftCode incoming = ShiftClock.Next(outgoing);
            DateOnly shiftDate = ShiftClock.ShiftDateFor(outgoing, now);

            List<NursingAssignment> assignments = await _assignmentRepository
                .GetAllNoTracking(
                    a => a.Shift == outgoing && a.ShiftDate == shiftDate && a.Admission!.Status == AdmissionRecordStatus.Admitted,
                    includeProperties: "Admission.Patient.Profile,Admission.Doctor.User.Profile")
                .ToListAsync(cancellationToken);

            List<Guid> existing = await _handoverCardRepository
                .GetAllNoTracking(c => c.ShiftDate == shiftDate && c.OutgoingShift == outgoing)
                .Select(c => c.AdmissionId)
                .ToListAsync(cancellationToken);

            List<NursingAssignment> missing = assignments.Where(a => !existing.Contains(a.AdmissionId)).ToList();
            if (missing.Count == 0) return;

            List<Guid> patientIds = missing.Select(a => a.PatientId).Distinct().ToList();

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository, missing.Select(a => a.AdmissionId).ToList(), cancellationToken);

            DateTime vitalsSince = now.AddHours(-24);
            List<VitalSign> vitals = await _vitalSignRepository
                .GetAllNoTracking(v => patientIds.Contains(v.PatientId) && v.RecordedAt >= vitalsSince)
                .OrderByDescending(v => v.RecordedAt)
                .ToListAsync(cancellationToken);

            List<NursingTask> tasks = await _taskRepository
                .GetAllNoTracking(t => patientIds.Contains(t.PatientId) && t.Status == NursingTaskStatus.Pending)
                .OrderBy(t => t.DueAt)
                .ToListAsync(cancellationToken);

            DateTime dueBefore = now.Add(DoseLookAhead);
            List<MedicationAdministration> doses = await _medicationRepository
                .GetAllNoTracking(m => patientIds.Contains(m.PatientId) && m.Status == AdministrationStatus.Scheduled && m.ScheduledAt <= dueBefore)
                .ToListAsync(cancellationToken);

            List<ClinicalAlert> alerts = await _alertRepository
                .GetAllNoTracking(a => patientIds.Contains(a.PatientId) && !a.IsAcknowledged)
                .ToListAsync(cancellationToken);

            foreach (NursingAssignment assignment in missing)
            {
                Guid patientId = assignment.PatientId;
                stays.TryGetValue(assignment.AdmissionId, out BedAssignment? stay);

                var sbar = HandoverComposer.Compose(
                    assignment,
                    stay,
                    vitals.FirstOrDefault(v => v.PatientId == patientId),
                    tasks.Where(t => t.PatientId == patientId).ToList(),
                    doses.Count(d => d.PatientId == patientId),
                    alerts.Where(a => a.PatientId == patientId).ToList(),
                    now);

                HandoverCard card = new HandoverCard(
                    Guid.NewGuid(),
                    assignment.AdmissionId,
                    patientId,
                    shiftDate,
                    outgoing,
                    incoming,
                    sbar.Situation,
                    sbar.Background,
                    sbar.Assessment,
                    sbar.Recommendation
                );
                card.SetTenantId(_user.GetTenantId());
                card.SetCreatedBy(_user.GetUserId());

                // The unique index (admission, date, shift) makes a concurrent duplicate fail harmlessly.
                await _handoverCardRepository.InsertAsync<HandoverCard, Guid>(card);
            }
        }
    }
}
