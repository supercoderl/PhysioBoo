using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Campaigns.UpdateCampaign
{
    public sealed class UpdateCampaignCommandValidation : AbstractValidator<UpdateCampaignCommand>
    {
        public UpdateCampaignCommandValidation()
        {
            RuleFor(c => c.Campaign.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Campaign.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Campaign.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.Campaign.Goal)
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.Campaign.GoalExceedsMaxLength).WithMessage("Goal may not exceed 255 characters.")
                .When(c => c.Campaign.Goal != null);

            RuleFor(c => c.Campaign.Description)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Campaign.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 2000 characters.")
                .When(c => c.Campaign.Description != null);

            RuleFor(c => c.Campaign.Budget)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Campaign.NegativeBudget).WithMessage("Budget may not be negative.")
                .When(c => c.Campaign.Budget.HasValue);

            RuleFor(c => c.Campaign.Spent)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Campaign.NegativeBudget).WithMessage("Spent may not be negative.")
                .When(c => c.Campaign.Spent.HasValue);

            RuleFor(c => c.Campaign)
                .Must(v => !v.StartDate.HasValue || !v.EndDate.HasValue || v.EndDate >= v.StartDate)
                .WithErrorCode(DomainErrorCodes.Campaign.InvalidDateRange).WithMessage("End date may not be before start date.");
        }
    }
}
