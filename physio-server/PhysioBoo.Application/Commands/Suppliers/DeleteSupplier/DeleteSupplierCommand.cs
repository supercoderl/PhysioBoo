using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Suppliers.DeleteSupplier
{
    public sealed class DeleteSupplierCommand : CommandBase
    {
        private static readonly DeleteSupplierCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteSupplierCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
