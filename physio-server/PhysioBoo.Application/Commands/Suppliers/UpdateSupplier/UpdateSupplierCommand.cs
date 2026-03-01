using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Suppliers.UpdateSupplier
{
    public sealed class UpdateSupplierCommand : CommandBase
    {
        private static readonly UpdateSupplierCommandValidation s_validation = new();

        public UpdateSupplierViewModel Supplier { get; }

        public UpdateSupplierCommand(UpdateSupplierViewModel supplier) : base(Guid.NewGuid())
        {
            Supplier = supplier;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
