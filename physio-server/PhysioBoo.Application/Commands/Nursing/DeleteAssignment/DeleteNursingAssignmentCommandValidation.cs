using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.DeleteAssignment
{
    public sealed class DeleteNursingAssignmentCommandValidation : AbstractValidator<DeleteNursingAssignmentCommand>
    {
        public DeleteNursingAssignmentCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
