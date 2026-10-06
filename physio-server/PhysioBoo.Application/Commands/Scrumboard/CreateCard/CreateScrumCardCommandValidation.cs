using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateCard
{
    public sealed class CreateScrumCardCommandValidation : AbstractValidator<CreateScrumCardCommand>
    {
        public CreateScrumCardCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.ListId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("List id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Title may not exceed 200 characters.");

            RuleFor(c => c.Input.Description)
                .MaximumLength(4000).WithErrorCode(DomainErrorCodes.Scrumboard.TextExceedsMaxLength).WithMessage("Description may not exceed 4000 characters.")
                .When(c => c.Input.Description != null);
        }
    }
}
