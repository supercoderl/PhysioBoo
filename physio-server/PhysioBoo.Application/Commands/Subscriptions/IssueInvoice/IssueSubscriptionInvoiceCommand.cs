namespace PhysioBoo.Application.Commands.Subscriptions.IssueInvoice
{
    /// <summary>
    /// Bills the tenant for its current period (rolling the period forward first if it has ended).
    /// </summary>
    public sealed class IssueSubscriptionInvoiceCommand : CommandBase, IRequest
    {
        private static readonly IssueSubscriptionInvoiceCommandValidation s_validation = new();

        public Guid HospitalGroupId { get; }

        public IssueSubscriptionInvoiceCommand(Guid hospitalGroupId) : base(hospitalGroupId)
        {
            HospitalGroupId = hospitalGroupId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
