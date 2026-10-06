using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Campaigns.CreateCampaign
{
    public sealed class CreateCampaignCommandHandler : CommandHandlerBase, IRequestHandler<CreateCampaignCommand>
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateCampaignCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICampaignRepository campaignRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _campaignRepository = campaignRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string code = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Campaign), cancellationToken);

            Campaign newCampaign = new Campaign(
                request.NewId,
                code,
                request.NewCampaign.Name,
                request.NewCampaign.Type,
                request.NewCampaign.AudienceSegmentId,
                request.NewCampaign.Goal,
                request.NewCampaign.StartDate,
                request.NewCampaign.EndDate,
                request.NewCampaign.Budget ?? 0,
                request.NewCampaign.Description
            );

            newCampaign.SetTenantId(_user.GetTenantId());
            newCampaign.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _campaignRepository.InsertAsync<Campaign, Guid>(newCampaign);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create campaign: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}