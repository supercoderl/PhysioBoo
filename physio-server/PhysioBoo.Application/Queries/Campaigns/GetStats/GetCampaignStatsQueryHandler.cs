using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Campaigns.GetStats
{
    public sealed class GetCampaignStatsQueryHandler : IRequestHandler<GetCampaignStatsQuery, CampaignStatsViewModel>
    {
        private readonly ICampaignRepository _campaignRepository;

        public GetCampaignStatsQueryHandler(
            ICampaignRepository campaignRepository
        )
        {
            _campaignRepository = campaignRepository;
        }

        public async Task<CampaignStatsViewModel> Handle(GetCampaignStatsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Domain.Entities.Crm.Campaign> campaigns = _campaignRepository.GetAllNoTracking();
            return new CampaignStatsViewModel
            {
                TotalCampaigns = await campaigns.CountAsync(cancellationToken),
                ActiveCampaigns = await campaigns.CountAsync(c => c.Status == Domain.Enums.CampaignStatus.Active, cancellationToken),
                TotalReach = await campaigns.SumAsync(c => (long)c.Reach, cancellationToken),
                TotalConversions = await campaigns.SumAsync(c => (long)c.Conversions, cancellationToken)
            };
        }
    }
}
