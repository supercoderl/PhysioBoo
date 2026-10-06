using PhysioBoo.Application.ViewModels.Campaigns;

namespace PhysioBoo.Application.Queries.Campaigns.GetById
{
    public sealed record GetCampaignByIdQuery(Guid Id) : IRequest<CampaignViewModel?>;
}
