

namespace PhysioBoo.Application.Commands.RetailCarts.EmailReceipt
{
    public sealed class EmailReceiptCommandValidation : AbstractValidator<EmailReceiptCommand>
    {
        public EmailReceiptCommandValidation()
        {
            RuleFor(cmd => cmd.TransactionId).NotEmpty();
            RuleFor(cmd => cmd.Request.Email).NotEmpty().EmailAddress();
        }
    }
}
