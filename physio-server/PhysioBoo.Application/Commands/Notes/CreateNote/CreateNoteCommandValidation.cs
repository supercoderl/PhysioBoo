using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Notes.CreateNote
{
    public sealed class CreateNoteCommandValidation : AbstractValidator<CreateNoteCommand>
    {
        public CreateNoteCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Note.EmptyId).WithMessage("Id may not be empty.");

            NoteInput.AddRules(this, c => c.NewNote);
        }
    }
}
