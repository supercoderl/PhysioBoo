using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Campaigns
{
    public sealed record UpdateCampaignViewModel(
        string Name,
        CampaignType Type,
        CampaignStatus Status,
        Guid? AudienceSegmentId,
        string? Goal,
        DateTime? StartDate,
        DateTime? EndDate,
        decimal? Budget,
        decimal? Spent,
        string? Description
    );
}
