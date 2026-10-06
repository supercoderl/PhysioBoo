using PhysioBoo.Application.ViewModels.Notes;

namespace PhysioBoo.Application.Commands.Notes.CreateNote
{
    public sealed class CreateNoteCommand : CommandBase, IRequest
    {
        private static readonly CreateNoteCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveNoteViewModel NewNote { get; }

        // Filled by the handler so the endpoint can return the saved note.
        public NoteViewModel? Result { get; set; }

        public CreateNoteCommand(Guid newId, SaveNoteViewModel newNote) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewNote = newNote;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
