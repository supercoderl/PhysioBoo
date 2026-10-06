using PhysioBoo.Application.ViewModels.Notes;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Notes.UpdateNote
{
    public sealed class UpdateNoteCommandHandler : CommandHandlerBase, IRequestHandler<UpdateNoteCommand>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IUser _user;

        public UpdateNoteCommandHandler(
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

        public async Task Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid ownerId = _user.GetUserId();
            SaveNoteViewModel vm = request.Input;

            // Someone else's note is reported as missing, so its existence is not revealed.
            Note? note = await _noteRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (note == null || note.OwnerUserId != ownerId)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Note with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string? title = NoteInput.CleanTitle(vm.Title);
            string content = vm.Content?.Trim() ?? string.Empty;
            string labelsJson = NoteJson.Write(NoteInput.CleanLabels(vm.Labels));
            string checklistJson = NoteJson.Write(NoteInput.CleanChecklist(vm.Checklist));
            DateTime? reminderAt = vm.ReminderAt;
            bool isPinned = vm.IsPinned;
            bool isArchived = vm.IsArchived;
            Guid? userId = ownerId;
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            int updated = await _noteRepository.BatchUpdateMultipleAsync(
                n => n.Id == request.Id && n.OwnerUserId == ownerId,
                s => s
                    .SetProperty(n => n.Title, title)
                    .SetProperty(n => n.Content, content)
                    .SetProperty(n => n.LabelsJson, labelsJson)
                    .SetProperty(n => n.ChecklistJson, checklistJson)
                    .SetProperty(n => n.ReminderAt, reminderAt)
                    .SetProperty(n => n.IsPinned, isPinned)
                    .SetProperty(n => n.IsArchived, isArchived)
                    .SetProperty(n => n.UpdatedBy, userId)
                    .SetProperty(n => n.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Note with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            note.SetTitle(title);
            note.SetContent(content);
            note.SetLabelsJson(labelsJson);
            note.SetChecklistJson(checklistJson);
            note.SetReminderAt(reminderAt);
            note.SetIsPinned(isPinned);
            note.SetIsArchived(isArchived);
            note.SetUpdatedAt(updatedAt);
            request.Result = NoteViewModel.FromEntity(note);
        }
    }
}
