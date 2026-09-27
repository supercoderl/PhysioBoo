using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Departments.DeleteDepartment
{
    public sealed class DeleteDepartmentCommandValidation : AbstractValidator<DeleteDepartmentCommand>
    {
        public DeleteDepartmentCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Department.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
