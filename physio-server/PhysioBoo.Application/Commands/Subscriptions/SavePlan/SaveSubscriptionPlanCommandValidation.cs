using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Subscriptions.SavePlan
{
    public sealed class SaveSubscriptionPlanCommandValidation : AbstractValidator<SaveSubscriptionPlanCommand>
    {
        public SaveSubscriptionPlanCommandValidation()
        {
            RuleFor(c => c.Plan.Code)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.EmptyCode).WithMessage("Plan code may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Subscription.EmptyCode).WithMessage("Plan code may not exceed 32 characters.")
                .Matches("^[A-Za-z0-9_-]+$").WithErrorCode(DomainErrorCodes.Subscription.EmptyCode).WithMessage("Plan code may only contain letters, digits, '-' and '_'.");

            RuleFor(c => c.Plan.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Subscription.EmptyName).WithMessage("Plan name may not be empty.")
                .MaximumLength(80).WithErrorCode(DomainErrorCodes.Subscription.EmptyName).WithMessage("Plan name may not exceed 80 characters.");

            RuleFor(c => c.Plan.MonthlyPrice)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Subscription.InvalidPrice).WithMessage("Monthly price may not be negative.");

            RuleFor(c => c.Plan.Currency)
                .NotEmpty().Length(3).WithErrorCode(DomainErrorCodes.Subscription.InvalidCurrency).WithMessage("Currency must be a 3-letter ISO code.");

            RuleFor(c => c.Plan.MaxUsers)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.Subscription.InvalidLimit).WithMessage("User limit must be greater than 0 (leave empty for unlimited).")
                .When(c => c.Plan.MaxUsers.HasValue);

            RuleFor(c => c.Plan.MaxBranches)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.Subscription.InvalidLimit).WithMessage("Branch limit must be greater than 0 (leave empty for unlimited).")
                .When(c => c.Plan.MaxBranches.HasValue);
        }
    }
}
