using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.AddUserRole
{
    public sealed class AddUserRoleCommandValidation : AbstractValidator<AddUserRoleCommand>
    {
        public AddUserRoleCommandValidation()
        {
            RuleFor(c => c.UserId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("User id may not be empty.");

            RuleFor(c => c.RoleId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Role id may not be empty.");
        }
    }
}
