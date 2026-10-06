using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Academy.SetLessonCompletion
{
    public sealed class SetLessonCompletionCommandValidation : AbstractValidator<SetLessonCompletionCommand>
    {
        public SetLessonCompletionCommandValidation()
        {
            RuleFor(c => c.LessonId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Lesson id may not be empty.");
        }
    }
}
