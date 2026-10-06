using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateBoard
{
    public sealed class CreateScrumBoardCommandValidation : AbstractValidator<CreateScrumBoardCommand>
    {
        public CreateScrumBoardCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Title may not exceed 120 characters.");

            RuleFor(c => c.Input.Description)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Description may not exceed 500 characters.")
                .When(c => c.Input.Description != null);
        }
    }
}
