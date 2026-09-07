

namespace PhysioBoo.Application.Commands.RetailCarts.SmsReceipt
{
    public sealed class SmsReceiptCommandValidation : AbstractValidator<SmsReceiptCommand>
    {
        public SmsReceiptCommandValidation()
        {
            RuleFor(cmd => cmd.TransactionId).NotEmpty();
            RuleFor(cmd => cmd.Request.Phone).NotEmpty();
        }
    }
}
