using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Notes.DeleteNote
{
    public sealed class DeleteNoteCommandValidation : AbstractValidator<DeleteNoteCommand>
    {
        public DeleteNoteCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Note.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
