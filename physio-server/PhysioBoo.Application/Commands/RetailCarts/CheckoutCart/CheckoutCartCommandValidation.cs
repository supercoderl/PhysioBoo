

namespace PhysioBoo.Application.Commands.RetailCarts.CheckoutCart
{
    public sealed class CheckoutCartCommandValidation : AbstractValidator<CheckoutCartCommand>
    {
        public CheckoutCartCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
            RuleFor(cmd => cmd.Checkout.TransactionId).NotEmpty();
            RuleFor(cmd => cmd.Checkout.HospitalId).NotEmpty();
            RuleFor(cmd => cmd.Checkout.PaymentSplits).NotEmpty();
            RuleFor(cmd => cmd.Checkout.AmountTendered).GreaterThanOrEqualTo(0);
        }
    }
}
