using MediatR;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker
{
    public sealed class CreateSys_SequenceTrackerCommandHandler : CommandHandlerBase, IRequestHandler<CreateSys_SequenceTrackerCommand>
    {
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;
        private readonly IUser _user;

        public CreateSys_SequenceTrackerCommandHandler(
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

        public async Task Handle(CreateSys_SequenceTrackerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Sys_SequenceTracker sys_SequenceTracker = new Sys_SequenceTracker(
                request.NewSys_SequenceTracker.Id,
                request.NewSys_SequenceTracker.EntityType,
                request.NewSys_SequenceTracker.Prefix,
                request.NewSys_SequenceTracker.UseDateFormating,
                request.NewSys_SequenceTracker.Suffix
            );

            sys_SequenceTracker.SetCreatedBy(_user.GetUserId());
            sys_SequenceTracker.SetSequenceLength(request.NewSys_SequenceTracker.SequenceLength);
            sys_SequenceTracker.SetCurrentSequence(request.NewSys_SequenceTracker.CurrentSequence);

            SharedKernel.Results.DbResult<Guid> result = await _sys_SequenceTrackerRepository.InsertAsync<Sys_SequenceTracker, Guid>(sys_SequenceTracker);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}