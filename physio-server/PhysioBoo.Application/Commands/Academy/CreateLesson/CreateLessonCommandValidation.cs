using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Academy.CreateLesson
{
    public sealed class CreateLessonCommandValidation : AbstractValidator<CreateLessonCommand>
    {
        public CreateLessonCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.CourseId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Course id may not be empty.");

            RuleFor(c => c.Input.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyTitle).WithMessage("Title is required.")
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Academy.TextExceedsMaxLength).WithMessage("Title may not exceed 200 characters.");

            RuleFor(c => c.Input.Content)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyContent).WithMessage("Content is required.")
                .MaximumLength(20000).WithErrorCode(DomainErrorCodes.Academy.TextExceedsMaxLength).WithMessage("Content may not exceed 20000 characters.");

            RuleFor(c => c.Input.DurationMinutes)
                .InclusiveBetween(1, 600).WithErrorCode(DomainErrorCodes.Academy.InvalidDuration).WithMessage("Duration must be between 1 and 600 minutes.");
        }
    }
}
