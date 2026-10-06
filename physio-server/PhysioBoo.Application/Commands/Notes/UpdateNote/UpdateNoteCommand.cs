using PhysioBoo.Application.ViewModels.Notes;

namespace PhysioBoo.Application.Commands.Notes.UpdateNote
{
    public sealed class UpdateNoteCommand : CommandBase, IRequest
    {
        private static readonly UpdateNoteCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveNoteViewModel Input { get; }

        public NoteViewModel? Result { get; set; }

        public UpdateNoteCommand(Guid id, SaveNoteViewModel input) : base(Guid.NewGuid())
        {
            Id = id;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
