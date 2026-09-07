

namespace PhysioBoo.Application.Commands.RetailCarts.RefundTransaction
{
    public sealed class RefundTransactionCommandValidation : AbstractValidator<RefundTransactionCommand>
    {
        public RefundTransactionCommandValidation()
        {
            RuleFor(cmd => cmd.TransactionId).NotEmpty();
            RuleFor(cmd => cmd.Refund.Reason).NotEmpty();
        }
    }
}
