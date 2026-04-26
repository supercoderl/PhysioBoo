using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AdminMenus.UpdateAdminMenu
{
    public sealed class UpdateAdminMenuCommandValidation : AbstractValidator<UpdateAdminMenuCommand>
    {
        public UpdateAdminMenuCommandValidation()
        {
            RuleForId();
            RuleForLabel();
            RuleForIcon();
            RuleForRoute();
            RuleForOrder();
            RuleForPermissionCode();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyId).WithMessage("Id may not be empty.");
        }

        public void RuleForLabel()
        {
            RuleFor(cmd => cmd.AdminMenu.Label).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyLabel).WithMessage("Label may not be empty.");
        }

        public void RuleForIcon()
        {
            RuleFor(cmd => cmd.AdminMenu.Icon).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyIcon).WithMessage("Icon may not be empty.");
        }

        public void RuleForRoute()
        {
            RuleFor(cmd => cmd.AdminMenu.Route).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyRoute).WithMessage("Route may not be empty.");
        }

        public void RuleForOrder()
        {
            RuleFor(cmd => cmd.AdminMenu.Order).GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.AdminMenu.InvalidOrder).WithMessage("Order must be greater than or equal to 0.");
        }

        public void RuleForPermissionCode()
        {
            RuleFor(cmd => cmd.AdminMenu.PermissionCode).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyPermissionCode).WithMessage("Permission code may not be empty.");
        }
    }
}