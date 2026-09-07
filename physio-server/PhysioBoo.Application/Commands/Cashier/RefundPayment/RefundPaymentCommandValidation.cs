

namespace PhysioBoo.Application.Commands.Cashier.RefundPayment
{
    public sealed class RefundPaymentCommandValidation : AbstractValidator<RefundPaymentCommand>
    {
        public RefundPaymentCommandValidation()
        {
            RuleFor(cmd => cmd.Refund.InvoiceId).NotEmpty();
            RuleFor(cmd => cmd.Refund.Amount).GreaterThan(0);
            RuleFor(cmd => cmd.Refund.Reason).NotEmpty();
        }
    }
}
