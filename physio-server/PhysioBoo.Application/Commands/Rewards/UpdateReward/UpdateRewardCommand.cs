using PhysioBoo.Application.ViewModels.Rewards;

namespace PhysioBoo.Application.Commands.Rewards.UpdateReward
{
    public sealed class UpdateRewardCommand : CommandBase, IRequest
    {
        private static readonly UpdateRewardCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateRewardViewModel Reward { get; }

        public UpdateRewardCommand(Guid id, UpdateRewardViewModel reward) : base(Guid.NewGuid())
        {
            Id = id;
            Reward = reward;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
