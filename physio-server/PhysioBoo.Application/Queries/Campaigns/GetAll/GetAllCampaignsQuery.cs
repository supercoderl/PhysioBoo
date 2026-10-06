using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Campaigns.GetAll
{
    public sealed record GetAllCampaignsQuery(PagedRequest<CampaignFilter> Request) : IRequest<PagedResult<CampaignViewModel>>;
}
