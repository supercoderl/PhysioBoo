using PhysioBoo.Application.ViewModels.Campaigns;

namespace PhysioBoo.Application.Commands.Campaigns.UpdateCampaign
{
    public sealed class UpdateCampaignCommand : CommandBase, IRequest
    {
        private static readonly UpdateCampaignCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateCampaignViewModel Campaign { get; }

        public UpdateCampaignCommand(Guid id, UpdateCampaignViewModel campaign) : base(Guid.NewGuid())
        {
            Id = id;
            Campaign = campaign;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
