using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.AdvanceStage
{
    public sealed class AdvanceStageCommandHandler : CommandHandlerBase, IRequestHandler<AdvanceStageCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public AdvanceStageCommandHandler(
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

        public async Task Handle(AdvanceStageCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SurgeryCase? surgery = await _surgeryRepository
                .GetAllNoTracking(c => c.Id == request.SurgeryId, includeProperties: "Timeline")
                .FirstOrDefaultAsync(cancellationToken);

            if (surgery == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Surgery with id {request.SurgeryId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (surgery.Status == SurgeryStatus.Cancelled)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "A cancelled surgery cannot move to another stage.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            SurgeryTimelineStage stage = Enum.Parse<SurgeryTimelineStage>(request.Stage, true);

            // Stages only move forward (a stage may be skipped, never repeated or revisited).
            SurgeryTimelineStage latest = surgery.Timeline.Count == 0 ? SurgeryTimelineStage.Scheduled : surgery.Timeline.Max(e => e.Stage);
            if (stage <= latest)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"The surgery has already reached {latest}; it cannot go back to {stage}.",
                    DomainErrorCodes.Surgery.StageOutOfOrder
                ));
                return;
            }

            DateTime occurredAt = request.Input.OccurredAt ?? TimeZoneHelper.GetLocalTimeNow();

            (SurgeryStatus status, OperatingRoomStatus? roomStatus) = Describe(stage);
            SharedKernel.Results.DbResult<Guid> result = await _surgeryRepository.AdvanceStageAsync(
                request.SurgeryId,
                stage,
                occurredAt,
                status,
                roomStatus,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    result.Error == DomainErrorCodes.Surgery.StageOutOfOrder
                        ? $"The {stage} stage has already been recorded."
                        : "Failed to update the surgery stage.",
                    result.Error ?? ErrorCodes.CommitFailed
                ));
                return;
            }

            SurgeryCase? updated = await _surgeryRepository.GetWithLinksAsync(request.SurgeryId, cancellationToken);
            if (updated != null) request.Result = SurgeryCaseViewModel.FromCase(updated, TimeZoneHelper.GetLocalTimeNow());
        }

        // The case status each stage puts the case in; only starting and finishing the operation touch the room.
        private static (SurgeryStatus Status, OperatingRoomStatus? RoomStatus) Describe(SurgeryTimelineStage stage)
        {
            return stage switch
            {
                SurgeryTimelineStage.PatientArrived => (SurgeryStatus.PatientArrived, null),
                SurgeryTimelineStage.PreOpCompleted => (SurgeryStatus.PreOpReady, null),
                SurgeryTimelineStage.AnesthesiaStarted => (SurgeryStatus.AnesthesiaStarted, null),
                SurgeryTimelineStage.SurgeryStarted => (SurgeryStatus.InProgress, OperatingRoomStatus.InSurgery),
                SurgeryTimelineStage.ProcedureCompleted => (SurgeryStatus.ProcedureCompleted, OperatingRoomStatus.Cleaning),
                SurgeryTimelineStage.Recovery => (SurgeryStatus.Recovery, null),
                SurgeryTimelineStage.DischargedFromOr => (SurgeryStatus.Discharged, null),
                _ => (SurgeryStatus.Scheduled, null)
            };
        }
    }
}
