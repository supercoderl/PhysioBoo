using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Subscriptions.SettleInvoice
{
    public sealed class SettleSubscriptionInvoiceCommandValidation : AbstractValidator<SettleSubscriptionInvoiceCommand>
    {
        public SettleSubscriptionInvoiceCommandValidation()
        {
            RuleFor(c => c.InvoiceId).NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.InvalidAction).WithMessage("Invoice id is required.");
            RuleFor(c => c.PaymentReference).MaximumLength(120).WithErrorCode(DomainErrorCodes.Subscription.InvalidAction).WithMessage("Payment reference may not exceed 120 characters.");
        }
    }
}
