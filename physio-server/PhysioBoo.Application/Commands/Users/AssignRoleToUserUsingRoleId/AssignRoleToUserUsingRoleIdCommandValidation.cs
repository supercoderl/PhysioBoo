using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUserUsingRoleId
{
    public sealed class AssignRoleToUserUsingRoleIdCommandValidation : AbstractValidator<AssignRoleToUserUsingRoleIdCommand>
    {
        public AssignRoleToUserUsingRoleIdCommandValidation()
        {
            RuleForUserId();
            RuleForRoleId();
        }

        public void RuleForUserId()
        {
            RuleFor(cmd => cmd.UserId).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyId).WithMessage("User id may not be empty.");
        }

        public void RuleForRoleId()
        {
            RuleFor(cmd => cmd.RoleId).NotEmpty().WithErrorCode(DomainErrorCodes.Role.EmptyId).WithMessage("Role id may not be empty.");
        }
    }
}
