using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUser
{
    public sealed class AssignRoleToUserCommandValidation : AbstractValidator<AssignRoleToUserCommand>
    {
        public AssignRoleToUserCommandValidation()
        {
            RuleForUserId();
        }

        public void RuleForUserId()
        {
            RuleFor(cmd => cmd.RoleForAssigning.UserId).NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyId).WithMessage("User id may not be empty.");
        }
    }
}
