using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Campaigns.DeleteCampaign
{
    public sealed class DeleteCampaignCommandHandler : CommandHandlerBase, IRequestHandler<DeleteCampaignCommand>
    {
        private readonly ICampaignRepository _campaignRepository;

        public DeleteCampaignCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICampaignRepository campaignRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _campaignRepository = campaignRepository;
        }

        public async Task Handle(DeleteCampaignCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Campaign? campaign = await _campaignRepository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (campaign == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Campaign with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _campaignRepository.SoftDeleteSingle(campaign, request.IsHard, cancellationToken);

            await CommitAsync();
        }
    }
}
