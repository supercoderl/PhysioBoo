using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Rewards.DeleteReward
{
    public sealed class DeleteRewardCommandHandler : CommandHandlerBase, IRequestHandler<DeleteRewardCommand>
    {
        private readonly IRewardRepository _rewardRepository;

        public DeleteRewardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRewardRepository rewardRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _rewardRepository = rewardRepository;
        }

        public async Task Handle(DeleteRewardCommand request, CancellationToken cancellationToken)
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

            // Soft delete: past redemptions keep pointing at the reward.
            _rewardRepository.SoftDeleteSingle(reward, false, cancellationToken);

            await CommitAsync();
        }
    }
}
