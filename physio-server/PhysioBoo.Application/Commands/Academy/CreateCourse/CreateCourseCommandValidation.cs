using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Academy.CreateCourse
{
    public sealed class CreateCourseCommandValidation : AbstractValidator<CreateCourseCommand>
    {
        public CreateCourseCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Academy.TextExceedsMaxLength).WithMessage("Title may not exceed 200 characters.");

            RuleFor(c => c.Input.Category)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyCategory).WithMessage("Category is required.")
                .MaximumLength(60).WithErrorCode(DomainErrorCodes.Academy.TextExceedsMaxLength).WithMessage("Category may not exceed 60 characters.");

            RuleFor(c => c.Input.Description)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Academy.TextExceedsMaxLength).WithMessage("Description may not exceed 2000 characters.")
                .When(c => c.Input.Description != null);
        }
    }
}
