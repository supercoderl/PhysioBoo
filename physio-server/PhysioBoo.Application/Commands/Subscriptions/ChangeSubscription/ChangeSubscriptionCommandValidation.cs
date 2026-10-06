using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Subscriptions.ChangeSubscription
{
    public sealed class ChangeSubscriptionCommandValidation : AbstractValidator<ChangeSubscriptionCommand>
    {
        public ChangeSubscriptionCommandValidation()
        {
            RuleFor(c => c.HospitalGroupId).NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.EmptyTenant).WithMessage("Tenant is required.");
            RuleFor(c => c.Action).IsInEnum().WithErrorCode(DomainErrorCodes.Subscription.InvalidAction).WithMessage("Action is not valid.");
            RuleFor(c => c.PlanId).NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.PlanInactive).WithMessage("Plan is required.")
                .When(c => c.Action == SubscriptionAction.ChangePlan);
            RuleFor(c => c.BillingEmail).EmailAddress().WithErrorCode(DomainErrorCodes.User.InvalidEmail).WithMessage("Billing email is not valid.")
                .When(c => !string.IsNullOrWhiteSpace(c.BillingEmail));
            RuleFor(c => c.Notes).MaximumLength(1000).WithErrorCode(DomainErrorCodes.Subscription.InvalidAction).WithMessage("Notes may not exceed 1000 characters.");
        }
    }
}
