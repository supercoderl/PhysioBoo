using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Rewards.CreateReward
{
    public sealed class CreateRewardCommandHandler : CommandHandlerBase, IRequestHandler<CreateRewardCommand>
    {
        private readonly IRewardRepository _rewardRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateRewardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRewardRepository rewardRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _rewardRepository = rewardRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateRewardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string code = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Reward), cancellationToken);

            Reward newReward = new Reward(
                request.NewId,
                code,
                request.NewReward.Title.Trim(),
                string.IsNullOrWhiteSpace(request.NewReward.Description) ? null : request.NewReward.Description.Trim(),
                request.NewReward.PointsRequired,
                Enum.Parse<RewardCategory>(request.NewReward.Category, true)
            );

            newReward.SetTenantId(_user.GetTenantId());
            newReward.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _rewardRepository.InsertAsync<Reward, Guid>(newReward);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create reward: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
