using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Academy.DeleteLesson
{
    public sealed class DeleteLessonCommandValidation : AbstractValidator<DeleteLessonCommand>
    {
        public DeleteLessonCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
