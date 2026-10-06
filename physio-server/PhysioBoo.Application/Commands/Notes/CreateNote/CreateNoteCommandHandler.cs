using PhysioBoo.Application.ViewModels.Notes;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Notes.CreateNote
{
    public sealed class CreateNoteCommandHandler : CommandHandlerBase, IRequestHandler<CreateNoteCommand>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IUser _user;

        public CreateNoteCommandHandler(
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

        public async Task Handle(CreateNoteCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SaveNoteViewModel vm = request.NewNote;

            Note note = new Note(
                request.NewId,
                _user.GetUserId(),
                NoteInput.CleanTitle(vm.Title),
                vm.Content?.Trim() ?? string.Empty,
                NoteJson.Write(NoteInput.CleanLabels(vm.Labels)),
                NoteJson.Write(NoteInput.CleanChecklist(vm.Checklist)),
                vm.ReminderAt,
                vm.IsPinned
            );
            note.SetIsArchived(vm.IsArchived);
            note.SetTenantId(_user.GetTenantId());
            note.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _noteRepository.InsertAsync<Note, Guid>(note);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create note: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = NoteViewModel.FromEntity(note);
        }
    }
}
