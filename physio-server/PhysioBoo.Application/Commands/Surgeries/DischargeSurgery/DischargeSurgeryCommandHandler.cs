using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.DischargeSurgery
{
    public sealed class DischargeSurgeryCommandHandler : CommandHandlerBase, IRequestHandler<DischargeSurgeryCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public DischargeSurgeryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _user = user;
        }

        public async Task Handle(DischargeSurgeryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SurgeryCase? surgery = await _surgeryRepository.GetByIdAsync(request.SurgeryId, ct: cancellationToken);
            if (surgery == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Surgery with id {request.SurgeryId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // A patient is discharged from theatre only once the procedure is over.
            if (surgery.Status != SurgeryStatus.ProcedureCompleted && surgery.Status != SurgeryStatus.Recovery)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Only a patient whose procedure is completed or who is in recovery can be discharged.",
                    DomainErrorCodes.Surgery.NotInRecovery
                ));
                return;
            }

            DateTime occurredAt = request.Input.OccurredAt ?? TimeZoneHelper.GetLocalTimeNow();

            SharedKernel.Results.DbResult<Guid> result = await _surgeryRepository.AdvanceStageAsync(
                request.SurgeryId,
                SurgeryTimelineStage.DischargedFromOr,
                occurredAt,
                SurgeryStatus.Discharged,
                null,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    result.Error == DomainErrorCodes.Surgery.StageOutOfOrder
                        ? "This patient has already been discharged."
                        : "Failed to discharge the patient.",
                    result.Error ?? ErrorCodes.CommitFailed
                ));
                return;
            }

            SurgeryCase? updated = await _surgeryRepository.GetWithLinksAsync(request.SurgeryId, cancellationToken);
            if (updated != null) request.Result = SurgeryCaseViewModel.FromCase(updated, TimeZoneHelper.GetLocalTimeNow());
        }
    }
}
