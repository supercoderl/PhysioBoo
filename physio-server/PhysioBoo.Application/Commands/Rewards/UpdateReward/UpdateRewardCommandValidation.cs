using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Rewards.UpdateReward
{
    public sealed class UpdateRewardCommandValidation : AbstractValidator<UpdateRewardCommand>
    {
        public UpdateRewardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Reward.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Reward.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Reward.EmptyTitle).WithMessage("Title may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Reward.TitleExceedsMaxLength).WithMessage("Title may not exceed 120 characters.");

            RuleFor(c => c.Reward.Description)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Reward.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 1000 characters.")
                .When(c => c.Reward.Description != null);

            RuleFor(c => c.Reward.PointsRequired)
                .GreaterThan(0).WithErrorCode(DomainErrorCodes.Reward.InvalidPointsRequired).WithMessage("Points required must be greater than 0.");

            RuleFor(c => c.Reward.Category)
                .Must(v => Enum.TryParse(v, true, out RewardCategory r) && Enum.IsDefined(r))
                .WithErrorCode(DomainErrorCodes.Reward.InvalidCategory).WithMessage("Category is not valid.");
        }
    }
}
