namespace PhysioBoo.Application.Commands.Subscriptions.ChangeSubscription
{
    public sealed class ChangeSubscriptionCommand : CommandBase, IRequest
    {
        private static readonly ChangeSubscriptionCommandValidation s_validation = new();

        public Guid HospitalGroupId { get; }
        public SubscriptionAction Action { get; }
        public Guid? PlanId { get; }
        public string? BillingEmail { get; }
        public string? Notes { get; }

        public ChangeSubscriptionCommand(Guid hospitalGroupId, SubscriptionAction action, Guid? planId, string? billingEmail, string? notes) : base(hospitalGroupId)
        {
            HospitalGroupId = hospitalGroupId;
            Action = action;
            PlanId = planId;
            BillingEmail = billingEmail;
            Notes = notes;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
