using PhysioBoo.Application.ViewModels.Tenants;

namespace PhysioBoo.Application.Commands.Tenants.RegisterTenant
{
    public sealed class RegisterTenantCommand : CommandBase, IRequest
    {
        private static readonly RegisterTenantCommandValidation s_validation = new();

        public Guid NewId { get; }
        public RegisterTenantViewModel NewTenant { get; }

        public RegisterTenantCommand(Guid newId, RegisterTenantViewModel newTenant) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewTenant = newTenant;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
