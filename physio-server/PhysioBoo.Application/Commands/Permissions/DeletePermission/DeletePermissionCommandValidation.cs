using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Permissions.DeletePermission
{
    public sealed class DeletePermissionCommandValidation : AbstractValidator<DeletePermissionCommand>
    {
        public DeletePermissionCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Permission.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
