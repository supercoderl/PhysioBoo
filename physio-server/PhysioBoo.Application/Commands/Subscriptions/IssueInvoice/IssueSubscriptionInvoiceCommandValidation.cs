using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Subscriptions.IssueInvoice
{
    public sealed class IssueSubscriptionInvoiceCommandValidation : AbstractValidator<IssueSubscriptionInvoiceCommand>
    {
        public IssueSubscriptionInvoiceCommandValidation()
        {
            RuleFor(c => c.HospitalGroupId).NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.EmptyTenant).WithMessage("Tenant is required.");
        }
    }
}
