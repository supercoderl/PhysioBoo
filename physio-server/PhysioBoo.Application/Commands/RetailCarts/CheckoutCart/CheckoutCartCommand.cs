
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.CheckoutCart
{
    public sealed class CheckoutCartCommand : CommandBase, IRequest
    {
        private static readonly CheckoutCartCommandValidation s_validation = new();

        public Guid CartId { get; }
        public CheckoutCartViewModel Checkout { get; }

        public CheckoutCartCommand(Guid cartId, CheckoutCartViewModel checkout) : base(Guid.NewGuid())
        {
            CartId = cartId;
            Checkout = checkout;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
