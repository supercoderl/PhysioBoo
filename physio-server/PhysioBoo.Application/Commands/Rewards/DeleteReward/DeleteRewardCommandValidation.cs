using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Rewards.DeleteReward
{
    public sealed class DeleteRewardCommandValidation : AbstractValidator<DeleteRewardCommand>
    {
        public DeleteRewardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Reward.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
