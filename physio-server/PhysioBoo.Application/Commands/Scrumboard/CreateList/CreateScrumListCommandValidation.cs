using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateList
{
    public sealed class CreateScrumListCommandValidation : AbstractValidator<CreateScrumListCommand>
    {
        public CreateScrumListCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.BoardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Board id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Title may not exceed 120 characters.");
        }
    }
}
