using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AdminMenus.UpdateAdminMenu
{
    public sealed class UpdateAdminMenuCommand : CommandBase, IRequest
    {
        private static readonly UpdateAdminMenuCommandValidation s_validation = new();

        public UpdateAdminMenuViewModel AdminMenu { get; }
        public Guid Id { get; }

        public UpdateAdminMenuCommand(
            UpdateAdminMenuViewModel adminMenu,
            Guid id
        ) : base(Guid.NewGuid())
        {
            AdminMenu = adminMenu;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
