using PhysioBoo.Application.ViewModels.Campaigns;

namespace PhysioBoo.Application.Queries.Campaigns.GetStats
{
    public sealed record GetCampaignStatsQuery : IRequest<CampaignStatsViewModel>;
}
