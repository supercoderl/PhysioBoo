using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.CreateSurgery
{
    public sealed class CreateSurgeryCommandHandler : CommandHandlerBase, IRequestHandler<CreateSurgeryCommand>
    {
        // The standard pre-operative checklist added to every case, in display order.
        private static readonly string[] s_defaultChecklist =
        {
            "Patient identity verified",
            "Surgical site marked",
            "Informed consent signed",
            "Fasting (NPO) status confirmed",
            "Allergies reviewed",
            "Pre-operative labs reviewed",
            "Imaging available in theatre",
            "Antibiotic prophylaxis given"
        };

        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IOperatingRoomRepository _roomRepository;
        private readonly ISurgeryAlertRepository _alertRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateSurgeryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            IOperatingRoomRepository roomRepository,
            ISurgeryAlertRepository alertRepository,
            IPatientRepository patientRepository,
            IDepartmentRepository departmentRepository,
            IUserRepository userRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _roomRepository = roomRepository;
            _alertRepository = alertRepository;
            _patientRepository = patientRepository;
            _departmentRepository = departmentRepository;
            _userRepository = userRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateSurgeryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            CreateSurgeryViewModel vm = request.NewSurgery;

            Patient? patient = await _patientRepository.GetByIdAsync(vm.PatientId, ct: cancellationToken);
            if (patient == null)
            {
                await NotFoundAsync(request, "Patient", vm.PatientId);
                return;
            }

            OperatingRoom? room = await _roomRepository.GetByIdAsync(vm.OperatingRoomId, ct: cancellationToken);
            if (room == null)
            {
                await NotFoundAsync(request, "Operating room", vm.OperatingRoomId);
                return;
            }

            if (vm.DepartmentId.HasValue && !await _departmentRepository.ExistsAsync(vm.DepartmentId.Value, cancellationToken))
            {
                await NotFoundAsync(request, "Department", vm.DepartmentId.Value);
                return;
            }

            List<Guid> staffIds = (vm.Team ?? new()).Select(m => m.StaffId).Distinct().ToList();
            if (staffIds.Count > 0)
            {
                int found = await _userRepository.GetAllNoTracking(u => staffIds.Contains(u.Id)).CountAsync(cancellationToken);
                if (found != staffIds.Count)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        "One or more team members don't exist.",
                        ErrorCodes.ObjectNotFound
                    ));
                    return;
                }
            }

            if (room.Status is OperatingRoomStatus.Maintenance or OperatingRoomStatus.Closed)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Operating room {room.RoomNumber} is {room.Status} and cannot be booked.",
                    DomainErrorCodes.Surgery.RoomNotUsable
                ));
                return;
            }

            if (await HasRoomConflictAsync(vm, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Operating room {room.RoomNumber} is already booked for that time.",
                    DomainErrorCodes.Surgery.RoomConflict
                ));
                return;
            }

            // Generate the number before any transaction: the generator opens its own.
            string surgeryNumber = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(SurgeryCase), cancellationToken);

            SurgeryPriority priority = Enum.Parse<SurgeryPriority>(vm.Priority, true);
            ConsentStatus consent = string.IsNullOrWhiteSpace(vm.ConsentStatus)
                ? ConsentStatus.NotObtained
                : Enum.Parse<ConsentStatus>(vm.ConsentStatus, true);

            SurgeryCase surgery = new SurgeryCase(
                request.NewId,
                surgeryNumber,
                vm.PatientId,
                vm.Procedure.Trim(),
                vm.SurgeryType.Trim(),
                vm.DepartmentId,
                vm.OperatingRoomId,
                vm.ScheduledStart,
                vm.EstimatedDurationMinutes,
                priority,
                vm.Diagnosis.Trim(),
                consent,
                string.IsNullOrWhiteSpace(vm.RiskAssessment) ? string.Empty : vm.RiskAssessment.Trim()
            );
            Stamp(surgery);

            foreach (CreateSurgeryTeamMemberViewModel member in vm.Team ?? new())
            {
                SurgeryTeamMember entity = new SurgeryTeamMember(Guid.NewGuid(), surgery.Id, member.StaffId, Enum.Parse<SurgicalTeamRole>(member.Role, true));
                Stamp(entity);
                surgery.Team.Add(entity);
            }

            foreach (CreateSurgeryEquipmentViewModel item in vm.Equipment ?? new())
            {
                SurgeryEquipmentItem entity = new SurgeryEquipmentItem(Guid.NewGuid(), surgery.Id, item.Name.Trim(), Enum.Parse<EquipmentCategory>(item.Category, true), item.Quantity);
                Stamp(entity);
                surgery.Equipment.Add(entity);
            }

            for (int i = 0; i < s_defaultChecklist.Length; i++)
            {
                SurgeryChecklistItem entity = new SurgeryChecklistItem(Guid.NewGuid(), surgery.Id, s_defaultChecklist[i], i + 1);
                Stamp(entity);
                surgery.Checklist.Add(entity);
            }

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            SurgeryTimelineEvent scheduled = new SurgeryTimelineEvent(Guid.NewGuid(), surgery.Id, SurgeryTimelineStage.Scheduled, now);
            Stamp(scheduled);
            surgery.Timeline.Add(scheduled);

            SharedKernel.Results.DbResult<Guid> created = await _surgeryRepository.CreateWithChildrenAsync(surgery, cancellationToken);
            if (!created.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to schedule surgery: {created.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            await RaiseSchedulingAlertsAsync(surgery, patient, cancellationToken);

            SurgeryCase? saved = await _surgeryRepository.GetWithLinksAsync(request.NewId, cancellationToken);
            if (saved != null) request.Result = SurgeryCaseViewModel.FromCase(saved, now);
        }

        // Same room, overlapping time, case still live. The end time is computed in memory because
        // start + duration (a column) cannot be translated; one day either side bounds the candidates.
        private async Task<bool> HasRoomConflictAsync(CreateSurgeryViewModel vm, CancellationToken cancellationToken)
        {
            DateTime start = vm.ScheduledStart;
            DateTime end = start.AddMinutes(vm.EstimatedDurationMinutes);

            List<SurgeryCase> candidates = await _surgeryRepository
                .GetAllNoTracking(c => c.OperatingRoomId == vm.OperatingRoomId
                    && c.Status != SurgeryStatus.Cancelled
                    && c.Status != SurgeryStatus.Discharged
                    && c.ScheduledStart < end
                    && c.ScheduledStart > start.AddDays(-1))
                .ToListAsync(cancellationToken);

            return candidates.Any(c => c.ScheduledStart.AddMinutes(c.EstimatedDurationMinutes) > start);
        }

        // Alerts are a convenience for the theatre desk: a failure to save one must not undo the booking.
        private async Task RaiseSchedulingAlertsAsync(SurgeryCase surgery, Patient patient, CancellationToken cancellationToken)
        {
            if (surgery.ConsentStatus != ConsentStatus.Signed)
            {
                SurgeryAlert alert = new SurgeryAlert(
                    Guid.NewGuid(),
                    surgery.Id,
                    surgery.PatientId,
                    SurgeryAlertType.MissingConsent,
                    surgery.Priority == SurgeryPriority.Emergency ? SurgeryAlertSeverity.High : SurgeryAlertSeverity.Warning,
                    $"Informed consent for {surgery.Procedure} ({surgery.SurgeryNumber}) is not signed.",
                    "Obtain the signed consent before the patient goes to theatre."
                );
                Stamp(alert);
                await _alertRepository.InsertAsync<SurgeryAlert, Guid>(alert);
            }

            if (!string.IsNullOrWhiteSpace(patient.AllergyInformation))
            {
                SurgeryAlert alert = new SurgeryAlert(
                    Guid.NewGuid(),
                    surgery.Id,
                    surgery.PatientId,
                    SurgeryAlertType.Allergy,
                    SurgeryAlertSeverity.High,
                    $"Recorded allergies: {patient.AllergyInformation.Trim()}.",
                    "Confirm allergies with the patient and brief the anaesthesia team."
                );
                Stamp(alert);
                await _alertRepository.InsertAsync<SurgeryAlert, Guid>(alert);
            }
        }

        private void Stamp(TenantEntity entity)
        {
            entity.SetTenantId(_user.GetTenantId());
            entity.SetCreatedBy(_user.GetUserId());
        }

        private async Task NotFoundAsync(CreateSurgeryCommand request, string what, Guid id)
        {
            await NotifyAsync(new DomainNotification(
                request.MessageType,
                $"{what} with id {id} doesn't exist.",
                ErrorCodes.ObjectNotFound
            ));
        }
    }
}
