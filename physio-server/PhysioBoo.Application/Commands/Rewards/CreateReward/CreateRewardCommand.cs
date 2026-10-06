using PhysioBoo.Application.ViewModels.Rewards;

namespace PhysioBoo.Application.Commands.Rewards.CreateReward
{
    public sealed class CreateRewardCommand : CommandBase, IRequest
    {
        private static readonly CreateRewardCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateRewardViewModel NewReward { get; }

        public CreateRewardCommand(Guid newId, CreateRewardViewModel newReward) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewReward = newReward;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
