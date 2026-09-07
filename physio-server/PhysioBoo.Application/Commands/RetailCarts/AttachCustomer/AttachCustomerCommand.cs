
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.AttachCustomer
{
    public sealed class AttachCustomerCommand : CommandBase, IRequest
    {
        private static readonly AttachCustomerCommandValidation s_validation = new();

        public Guid CartId { get; }
        public AttachCustomerViewModel Customer { get; }

        public AttachCustomerCommand(Guid cartId, AttachCustomerViewModel customer) : base(Guid.NewGuid())
        {
            CartId = cartId;
            Customer = customer;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
