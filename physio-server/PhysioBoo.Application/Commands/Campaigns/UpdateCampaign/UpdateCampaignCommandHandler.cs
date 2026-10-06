using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Campaigns.UpdateCampaign
{
    public sealed class UpdateCampaignCommandHandler : CommandHandlerBase, IRequestHandler<UpdateCampaignCommand>
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IUser _user;

        public UpdateCampaignCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICampaignRepository campaignRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _campaignRepository = campaignRepository;
            _user = user;
        }

        public async Task Handle(UpdateCampaignCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Crm.Campaign? campaign = await _campaignRepository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (campaign == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Campaign with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            campaign.SetName(request.Campaign.Name);
            campaign.SetType(request.Campaign.Type);
            campaign.SetStatus(request.Campaign.Status);
            campaign.SetAudienceSegmentId(request.Campaign.AudienceSegmentId);
            campaign.SetGoal(request.Campaign.Goal);
            campaign.SetStartDate(request.Campaign.StartDate);
            campaign.SetEndDate(request.Campaign.EndDate);
            campaign.SetBudget(request.Campaign.Budget ?? 0);
            campaign.SetSpent(request.Campaign.Spent ?? campaign.Spent);
            campaign.SetDescription(request.Campaign.Description);
            campaign.SetUpdatedBy(_user.GetUserId());

            await _campaignRepository.UpdateTrackedAsync(campaign, cancellationToken);
        }
    }
}