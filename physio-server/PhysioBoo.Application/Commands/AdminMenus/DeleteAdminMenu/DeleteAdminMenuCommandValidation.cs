using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AdminMenus.DeleteAdminMenu
{
    public sealed class DeleteAdminMenuCommandValidation : AbstractValidator<DeleteAdminMenuCommand>
    {
        public DeleteAdminMenuCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyId).WithMessage("Id cannot be empty.");
        }
    }
}