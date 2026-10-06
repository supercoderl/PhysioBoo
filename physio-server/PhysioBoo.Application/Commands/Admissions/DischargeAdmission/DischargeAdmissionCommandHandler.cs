using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Commands.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Admissions.DischargeAdmission
{
    public sealed class DischargeAdmissionCommandHandler : CommandHandlerBase, IRequestHandler<DischargeAdmissionCommand>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IBedRepository _bedRepository;

        public DischargeAdmissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdmissionRepository admissionRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IBedRepository bedRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _admissionRepository = admissionRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _bedRepository = bedRepository;
        }

        public async Task Handle(DischargeAdmissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Admission? admission = await _admissionRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (admission == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Admission with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (admission.Status != AdmissionRecordStatus.Admitted)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This admission is not active.",
                    DomainErrorCodes.Admission.NotAdmitted
                ));
                return;
            }

            DateTime dischargedAt = request.Input.DischargedAt ?? TimeZoneHelper.GetLocalTimeNow();
            string? notes = string.IsNullOrWhiteSpace(request.Input.Notes) ? null : request.Input.Notes.Trim();

            BedAssignment? openStay = await _bedAssignmentRepository
                .GetAllNoTracking(a => a.AdmissionId == request.Id && a.DischargedAt == null)
                .FirstOrDefaultAsync(cancellationToken);

            // An admission in a bed is discharged through the bed, which frees it and closes the admission atomically.
            if (openStay != null)
            {
                SharedKernel.Results.DbResult<Guid> result = await _bedRepository.DischargeAsync(
                    openStay.BedId,
                    dischargedAt,
                    notes,
                    cancellationToken
                );

                if (!result.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        BedOperationErrors.Describe(result.Error),
                        result.Error ?? ErrorCodes.CommitFailed
                    ));
                }
                return;
            }

            // No bed: only the admission itself changes. Guarded so a concurrent discharge is not repeated.
            DateTime? dischargedAtValue = dischargedAt;
            int updated = await _admissionRepository.BatchUpdateMultipleAsync(
                a => a.Id == request.Id && a.Status == AdmissionRecordStatus.Admitted,
                s => s
                    .SetProperty(a => a.Status, AdmissionRecordStatus.Discharged)
                    .SetProperty(a => a.DischargedAt, dischargedAtValue)
                    .SetProperty(a => a.DischargeNotes, notes),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This admission is not active.",
                    DomainErrorCodes.Admission.NotAdmitted
                ));
            }
        }
    }
}
