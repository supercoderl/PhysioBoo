

namespace PhysioBoo.Application.Commands.Cashier.ReceivePayment
{
    public sealed class ReceivePaymentCommandValidation : AbstractValidator<ReceivePaymentCommand>
    {
        public ReceivePaymentCommandValidation()
        {
            RuleFor(cmd => cmd.Payment.InvoiceId).NotEmpty();
            RuleFor(cmd => cmd.Payment.Splits).NotEmpty();
            RuleFor(cmd => cmd.Payment.AmountTendered).GreaterThan(0);
        }
    }
}
