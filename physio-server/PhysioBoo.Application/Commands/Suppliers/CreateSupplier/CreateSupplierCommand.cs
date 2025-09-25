using MediatR;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommand : CommandBase, IRequest
    {
        private static readonly CreateSupplierCommandValidation s_validation = new();

        public CreateSupplierViewModel NewSupplier { get; }

        public CreateSupplierCommand(CreateSupplierViewModel newSupplier) : base(Guid.NewGuid())
        {
            NewSupplier = newSupplier;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
