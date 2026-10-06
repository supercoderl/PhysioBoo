using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Admissions;
using PhysioBoo.Application.Queries.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.CreateAssignment
{
    public sealed class CreateNursingAssignmentCommandHandler : CommandHandlerBase, IRequestHandler<CreateNursingAssignmentCommand>
    {
        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IUser _user;

        public CreateNursingAssignmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INursingAssignmentRepository assignmentRepository,
            IAdmissionRepository admissionRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IClinicalAlertRepository alertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _assignmentRepository = assignmentRepository;
            _admissionRepository = admissionRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task Handle(CreateNursingAssignmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var input = request.Input;

            Admission? admission = await _admissionRepository.GetByIdAsync(input.AdmissionId, ct: cancellationToken);
            if (admission == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Admission with id {input.AdmissionId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (admission.Status != AdmissionRecordStatus.Admitted)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "The patient is no longer admitted.",
                    DomainErrorCodes.Nursing.NoActiveAdmission
                ));
                return;
            }

            ShiftCode shift = Enum.Parse<ShiftCode>(input.Shift, true);
            AcuityLevel acuity = Enum.Parse<AcuityLevel>(input.Acuity, true);
            Guid nurseUserId = input.NurseUserId ?? _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateOnly shiftDate = input.ShiftDate.HasValue
                ? DateOnly.FromDateTime(input.ShiftDate.Value)
                : ShiftClock.ShiftDateFor(shift, now);

            NursingAssignment? existing = await _assignmentRepository
                .GetAllNoTracking(a => a.AdmissionId == input.AdmissionId && a.Shift == shift && a.ShiftDate == shiftDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                Guid? userId = _user.GetUserId();
                DateTime? updatedAt = now;

                await _assignmentRepository.BatchUpdateMultipleAsync(
                    a => a.Id == existing.Id,
                    s => s
                        .SetProperty(a => a.NurseUserId, nurseUserId)
                        .SetProperty(a => a.Acuity, acuity)
                        .SetProperty(a => a.FallRisk, input.FallRisk)
                        .SetProperty(a => a.UpdatedBy, userId)
                        .SetProperty(a => a.UpdatedAt, updatedAt),
                    cancellationToken
                );

                request.ResultId = existing.Id;
            }
            else
            {
                NursingAssignment assignment = new NursingAssignment(
                    Guid.NewGuid(),
                    input.AdmissionId,
                    admission.PatientId,
                    nurseUserId,
                    shift,
                    shiftDate,
                    acuity,
                    input.FallRisk
                );
                assignment.SetTenantId(_user.GetTenantId());
                assignment.SetCreatedBy(_user.GetUserId());

                SharedKernel.Results.DbResult<Guid> result = await _assignmentRepository.InsertAsync<NursingAssignment, Guid>(assignment);
                if (!result.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Failed to create the assignment: {result.Error}",
                        ErrorCodes.CommitFailed
                    ));
                    return;
                }

                request.ResultId = assignment.Id;
            }

            await RaiseRiskAlertsAsync(admission, input.FallRisk, cancellationToken);
        }

        // Turns what the admission and bed already say into open alerts, so the dashboard banner has something to show.
        private async Task RaiseRiskAlertsAsync(Admission admission, bool fallRisk, CancellationToken cancellationToken)
        {
            Guid tenantId = _user.GetTenantId();
            Guid userId = _user.GetUserId();

            if (fallRisk)
            {
                await ClinicalAlertRaiser.EnsureOpenAsync(_alertRepository, admission.PatientId, ClinicalAlertType.FallRisk,
                    ClinicalAlertSeverity.High, "Fall risk: keep the bed low and call bell within reach.", tenantId, userId, cancellationToken);
            }

            if (!string.IsNullOrWhiteSpace(admission.Allergies))
            {
                await ClinicalAlertRaiser.EnsureOpenAsync(_alertRepository, admission.PatientId, ClinicalAlertType.Allergy,
                    ClinicalAlertSeverity.High, $"Allergies: {admission.Allergies}", tenantId, userId, cancellationToken);
            }

            if (admission.AdmissionType == AdmissionType.Emergency)
            {
                await ClinicalAlertRaiser.EnsureOpenAsync(_alertRepository, admission.PatientId, ClinicalAlertType.Emergency,
                    ClinicalAlertSeverity.Medium, "Emergency admission.", tenantId, userId, cancellationToken);
            }

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository, new[] { admission.Id }, cancellationToken);

            Bed? bed = stays.GetValueOrDefault(admission.Id)?.Bed;
            if (bed != null && (bed.IsolationRequired || bed.BedType == BedType.Isolation))
            {
                await ClinicalAlertRaiser.EnsureOpenAsync(_alertRepository, admission.PatientId, ClinicalAlertType.Isolation,
                    ClinicalAlertSeverity.High, "Isolation precautions required.", tenantId, userId, cancellationToken);
            }
        }
    }
}
