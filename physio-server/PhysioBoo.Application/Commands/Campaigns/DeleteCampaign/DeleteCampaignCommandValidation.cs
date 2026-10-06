using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Campaigns.DeleteCampaign
{
    public sealed class DeleteCampaignCommandValidation : AbstractValidator<DeleteCampaignCommand>
    {
        public DeleteCampaignCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Campaign.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
