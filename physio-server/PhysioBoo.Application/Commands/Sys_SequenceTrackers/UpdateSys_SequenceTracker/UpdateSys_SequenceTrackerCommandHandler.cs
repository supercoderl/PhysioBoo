using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker
{
    public sealed class UpdateSys_SequenceTrackerCommandHandler : CommandHandlerBase, IRequestHandler<UpdateSys_SequenceTrackerCommand>
    {
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;
        private readonly IUser _user;

        public UpdateSys_SequenceTrackerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(UpdateSys_SequenceTrackerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.Sys_SequenceTracker? sys_SequenceTracker = await _sys_SequenceTrackerRepository.GetByIdAsync(request.Sys_SequenceTracker.Id);

            if (sys_SequenceTracker == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Sequence tracker with Id {request.Sys_SequenceTracker.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            sys_SequenceTracker.SetEntityType(request.Sys_SequenceTracker.EntityType);
            sys_SequenceTracker.SetPrefix(request.Sys_SequenceTracker.Prefix);
            sys_SequenceTracker.SetUseDateFormating(request.Sys_SequenceTracker.UseDateFormating);
            sys_SequenceTracker.SetSequenceLength(request.Sys_SequenceTracker.SequenceLength);
            sys_SequenceTracker.SetCurrentSequence(request.Sys_SequenceTracker.CurrentSequence);
            sys_SequenceTracker.SetSuffix(request.Sys_SequenceTracker.Suffix);
            sys_SequenceTracker.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());
            sys_SequenceTracker.SetUpdatedBy(_user.GetUserId());

            await _sys_SequenceTrackerRepository.UpdateTrackedAsync(sys_SequenceTracker, cancellationToken);
        }
    }
}