namespace PhysioBoo.Application.Commands.Rewards.DeleteReward
{
    public sealed class DeleteRewardCommand : CommandBase, IRequest
    {
        private static readonly DeleteRewardCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteRewardCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
