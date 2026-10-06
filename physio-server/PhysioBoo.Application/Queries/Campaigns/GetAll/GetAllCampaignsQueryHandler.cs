using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Campaigns.GetAll
{
    public sealed class GetAllCampaignsQueryHandler : IRequestHandler<GetAllCampaignsQuery, PagedResult<CampaignViewModel>>
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly ISortingExpressionProvider<CampaignViewModel, Campaign> _sortingExpressionProvider;

        public GetAllCampaignsQueryHandler(
            ICampaignRepository campaignRepository,
            ISortingExpressionProvider<CampaignViewModel, Campaign> sortingExpressionProvider
        )
        {
            _campaignRepository = campaignRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<CampaignViewModel>> Handle(GetAllCampaignsQuery q, CancellationToken cancellationToken)
        {
            CampaignsSearchSpec spec = new CampaignsSearchSpec(q, _sortingExpressionProvider);
            PagedResult<Campaign> paged = await _campaignRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<CampaignViewModel>(
                paged.TotalCount,
                paged.Items.Select(CampaignViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
