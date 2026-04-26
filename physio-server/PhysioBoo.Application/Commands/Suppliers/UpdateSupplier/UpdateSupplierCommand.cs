using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Suppliers.UpdateSupplier
{
    public sealed class UpdateSupplierCommand : CommandBase
    {
        private static readonly UpdateSupplierCommandValidation s_validation = new();

        public UpdateSupplierViewModel Supplier { get; }
        public Guid Id { get; }

        public UpdateSupplierCommand(UpdateSupplierViewModel supplier, Guid id) : base(Guid.NewGuid())
        {
            Supplier = supplier;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
