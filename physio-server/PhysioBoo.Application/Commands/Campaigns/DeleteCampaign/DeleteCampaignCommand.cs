namespace PhysioBoo.Application.Commands.Campaigns.DeleteCampaign
{
    public sealed class DeleteCampaignCommand : CommandBase, IRequest
    {
        private static readonly DeleteCampaignCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteCampaignCommand(Guid id, bool isHard) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
