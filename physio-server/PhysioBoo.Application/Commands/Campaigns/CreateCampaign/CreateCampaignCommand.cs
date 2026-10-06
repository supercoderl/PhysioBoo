using PhysioBoo.Application.ViewModels.Campaigns;

namespace PhysioBoo.Application.Commands.Campaigns.CreateCampaign
{
    public sealed class CreateCampaignCommand : CommandBase, IRequest
    {
        private static readonly CreateCampaignCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateCampaignViewModel NewCampaign { get; }

        public CreateCampaignCommand(Guid newId, CreateCampaignViewModel newCampaign) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewCampaign = newCampaign;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
