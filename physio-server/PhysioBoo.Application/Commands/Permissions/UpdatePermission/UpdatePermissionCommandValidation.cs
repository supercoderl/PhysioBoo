using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Permissions.UpdatePermission
{
    public sealed class UpdatePermissionCommandValidation : AbstractValidator<UpdatePermissionCommand>
    {
        public UpdatePermissionCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForCode();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Permission.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.Permission.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyCode)
                .WithMessage("Code may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Code may not be longer than 255 characters.");
        }
    }
}
