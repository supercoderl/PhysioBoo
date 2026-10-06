using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Academy.DeleteCourse
{
    public sealed class DeleteCourseCommandValidation : AbstractValidator<DeleteCourseCommand>
    {
        public DeleteCourseCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Academy.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
