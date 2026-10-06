using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Campaigns.GetById
{
    public sealed class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, CampaignViewModel?>
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IMediatorHandler _bus;

        public GetCampaignByIdQueryHandler(
            ICampaignRepository campaignRepository,
            IMediatorHandler bus
        )
        {
            _campaignRepository = campaignRepository;
            _bus = bus;
        }

        public async Task<CampaignViewModel?> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
        {
            Domain.Entities.Crm.Campaign? campaign = await _campaignRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (campaign == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetCampaignByIdQuery),
                    $"Campaign with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return CampaignViewModel.FromEntity(campaign);
        }
    }
}
