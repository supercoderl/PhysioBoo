namespace PhysioBoo.Application.Commands.Subscriptions.SettleInvoice
{
    public enum InvoiceSettlement
    {
        Pay,
        Void
    }

    public sealed class SettleSubscriptionInvoiceCommand : CommandBase, IRequest
    {
        private static readonly SettleSubscriptionInvoiceCommandValidation s_validation = new();

        public Guid InvoiceId { get; }
        public InvoiceSettlement Settlement { get; }
        public string? PaymentReference { get; }

        public SettleSubscriptionInvoiceCommand(Guid invoiceId, InvoiceSettlement settlement, string? paymentReference) : base(invoiceId)
        {
            InvoiceId = invoiceId;
            Settlement = settlement;
            PaymentReference = paymentReference;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
