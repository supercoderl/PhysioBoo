namespace PhysioBoo.Application.Commands.Notes.DeleteNote
{
    public sealed class DeleteNoteCommand : CommandBase, IRequest
    {
        private static readonly DeleteNoteCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteNoteCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
