using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.AdminMenus.CreateAdminMenu
{
    public sealed class CreateAdminMenuCommandValidation : AbstractValidator<CreateAdminMenuCommand>
    {
        public CreateAdminMenuCommandValidation()
        {
            RuleForLabel();
            RuleForIcon();
            RuleForRoute();
            RuleForOrder();
            RuleForPermissionCode();
        }

        public void RuleForLabel()
        {
            RuleFor(cmd => cmd.NewAdminMenu.Label).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyLabel).WithMessage("Label may not be empty.");
        }

        public void RuleForIcon()
        {
            RuleFor(cmd => cmd.NewAdminMenu.Icon).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyIcon).WithMessage("Icon may not be empty.");
        }

        public void RuleForRoute()
        {
            RuleFor(cmd => cmd.NewAdminMenu.Route).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyRoute).WithMessage("Route may not be empty.");
        }

        public void RuleForOrder()
        {
            RuleFor(cmd => cmd.NewAdminMenu.Order).GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.AdminMenu.InvalidOrder).WithMessage("Order must be a non-negative integer.");
        }

        public void RuleForPermissionCode()
        {
            RuleFor(cmd => cmd.NewAdminMenu.PermissionCode).NotEmpty().WithErrorCode(DomainErrorCodes.AdminMenu.EmptyPermissionCode).WithMessage("Permission code may not be empty.");
        }
    }
}