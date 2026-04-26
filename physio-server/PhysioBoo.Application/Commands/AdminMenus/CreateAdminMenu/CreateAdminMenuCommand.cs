using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AdminMenus.CreateAdminMenu
{
    public sealed class CreateAdminMenuCommand : CommandBase, IRequest
    {
        private static readonly CreateAdminMenuCommandValidation s_validation = new();

        public CreateAdminMenuViewModel NewAdminMenu { get; }
        public Guid NewId { get; }

        public CreateAdminMenuCommand(
            CreateAdminMenuViewModel newAdminMenu,
            Guid newId
        ) : base(Guid.NewGuid())
        {
            NewAdminMenu = newAdminMenu;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
