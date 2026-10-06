using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members.RedeemPoints
{
    public sealed class RedeemPointsCommandValidation : AbstractValidator<RedeemPointsCommand>
    {
        public RedeemPointsCommandValidation()
        {
            RuleFor(c => c.MemberId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Member.EmptyId).WithMessage("Member id may not be empty.");

            RuleFor(c => c.Input.RewardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Reward.EmptyId).WithMessage("Reward may not be empty.");

            RuleFor(c => c.Input.Description)
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.PointTransaction.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 255 characters.")
                .When(c => c.Input.Description != null);
        }
    }
}
