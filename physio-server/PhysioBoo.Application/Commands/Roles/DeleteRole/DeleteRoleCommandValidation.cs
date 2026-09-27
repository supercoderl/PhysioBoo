using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Roles.DeleteRole
{
    public sealed class DeleteRoleCommandValidation : AbstractValidator<DeleteRoleCommand>
    {
        public DeleteRoleCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Role.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
