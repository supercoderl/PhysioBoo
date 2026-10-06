using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateList
{
    public sealed class UpdateScrumListCommandValidation : AbstractValidator<UpdateScrumListCommand>
    {
        public UpdateScrumListCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Title may not exceed 120 characters.");
        }
    }
}
