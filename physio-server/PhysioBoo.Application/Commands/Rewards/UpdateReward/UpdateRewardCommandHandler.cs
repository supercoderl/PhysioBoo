using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Rewards.UpdateReward
{
    public sealed class UpdateRewardCommandHandler : CommandHandlerBase, IRequestHandler<UpdateRewardCommand>
    {
        private readonly IRewardRepository _rewardRepository;
        private readonly IUser _user;

        public UpdateRewardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRewardRepository rewardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _rewardRepository = rewardRepository;
            _user = user;
        }

        public async Task Handle(UpdateRewardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Crm.Reward? reward = await _rewardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (reward == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Reward with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            reward.SetTitle(request.Reward.Title.Trim());
            reward.SetDescription(string.IsNullOrWhiteSpace(request.Reward.Description) ? null : request.Reward.Description.Trim());
            reward.SetPointsRequired(request.Reward.PointsRequired);
            reward.SetCategory(Enum.Parse<RewardCategory>(request.Reward.Category, true));
            reward.SetIsAvailable(request.Reward.Available);
            reward.SetUpdatedBy(_user.GetUserId());

            await _rewardRepository.UpdateTrackedAsync(reward, cancellationToken);
        }
    }
}
