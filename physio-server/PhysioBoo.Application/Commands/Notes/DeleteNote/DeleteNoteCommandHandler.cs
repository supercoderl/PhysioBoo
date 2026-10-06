using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Notes.DeleteNote
{
    public sealed class DeleteNoteCommandHandler : CommandHandlerBase, IRequestHandler<DeleteNoteCommand>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IUser _user;

        public DeleteNoteCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INoteRepository noteRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _noteRepository = noteRepository;
            _user = user;
        }

        public async Task Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // Someone else's note is reported as missing, so its existence is not revealed.
            Note? note = await _noteRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (note == null || note.OwnerUserId != _user.GetUserId())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Note with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _noteRepository.SoftDeleteSingle(note, false, cancellationToken);

            await CommitAsync();
        }
    }
}
