using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Notes.UpdateNote
{
    public sealed class UpdateNoteCommandValidation : AbstractValidator<UpdateNoteCommand>
    {
        public UpdateNoteCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Note.EmptyId).WithMessage("Id may not be empty.");

            NoteInput.AddRules(this, c => c.Input);
        }
    }
}
