using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker
{
    public sealed class DeleteSys_SequenceTrackerCommandHandler : CommandHandlerBase, IRequestHandler<DeleteSys_SequenceTrackerCommand>
    {
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public DeleteSys_SequenceTrackerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(DeleteSys_SequenceTrackerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.Sys_SequenceTracker? sys_SequenceTracker = await _sys_SequenceTrackerRepository.GetByIdAsync(request.Id);

            if (sys_SequenceTracker == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Sequence tracker not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _sys_SequenceTrackerRepository.SoftDeleteSingle(
                sys_SequenceTracker,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}