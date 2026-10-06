using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Campaigns.CreateCampaign
{
    public sealed class CreateCampaignCommandValidation : AbstractValidator<CreateCampaignCommand>
    {
        public CreateCampaignCommandValidation()
        {
            RuleFor(c => c.NewCampaign.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Campaign.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Campaign.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.NewCampaign.Goal)
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.Campaign.GoalExceedsMaxLength).WithMessage("Goal may not exceed 255 characters.")
                .When(c => c.NewCampaign.Goal != null);

            RuleFor(c => c.NewCampaign.Description)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Campaign.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 2000 characters.")
                .When(c => c.NewCampaign.Description != null);

            RuleFor(c => c.NewCampaign.Budget)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Campaign.NegativeBudget).WithMessage("Budget may not be negative.")
                .When(c => c.NewCampaign.Budget.HasValue);

            RuleFor(c => c.NewCampaign)
                .Must(v => !v.StartDate.HasValue || !v.EndDate.HasValue || v.EndDate >= v.StartDate)
                .WithErrorCode(DomainErrorCodes.Campaign.InvalidDateRange).WithMessage("End date may not be before start date.");
        }
    }
}
