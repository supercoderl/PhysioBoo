using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Campaigns
{
    public sealed record CreateCampaignViewModel(
        string Name,
        CampaignType Type,
        Guid? AudienceSegmentId,
        string? Goal,
        DateTime? StartDate,
        DateTime? EndDate,
        decimal? Budget,
        string? Description
    );
}
