using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.RemoveUserRole
{
    public sealed class RemoveUserRoleCommandValidation : AbstractValidator<RemoveUserRoleCommand>
    {
        public RemoveUserRoleCommandValidation()
        {
            RuleFor(c => c.UserId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("User id may not be empty.");

            RuleFor(c => c.RoleId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Role id may not be empty.");
        }
    }
}
