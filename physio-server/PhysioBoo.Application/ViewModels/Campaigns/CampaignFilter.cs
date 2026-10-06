using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Campaigns
{
    public sealed record CampaignFilter(
        DateTime? Start,
        DateTime? End,
        CampaignType? Type,
        CampaignStatus? Status
    );
}
