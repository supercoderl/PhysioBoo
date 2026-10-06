using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Members.RedeemPoints
{
    public sealed class RedeemPointsCommandHandler : CommandHandlerBase, IRequestHandler<RedeemPointsCommand>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IRewardRepository _rewardRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public RedeemPointsCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMemberRepository memberRepository,
            IRewardRepository rewardRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _memberRepository = memberRepository;
            _rewardRepository = rewardRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(RedeemPointsCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MemberPoint? member = await _memberRepository.GetByIdAsync(request.MemberId, ct: cancellationToken);
            if (member == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Member with id {request.MemberId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            Reward? reward = await _rewardRepository.GetByIdAsync(request.Input.RewardId, ct: cancellationToken);
            if (reward == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Reward with id {request.Input.RewardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (member.Status != MemberStatus.Active)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    PointChangeErrors.Describe(DomainErrorCodes.Member.NotActive),
                    DomainErrorCodes.Member.NotActive
                ));
                return;
            }

            if (!reward.IsAvailable)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Reward is not available.",
                    DomainErrorCodes.Reward.NotAvailable
                ));
                return;
            }

            // Early check for a clear message. The atomic UPDATE in ApplyPointsAsync is the real guard.
            if (member.Points < reward.PointsRequired)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    PointChangeErrors.Describe(DomainErrorCodes.PointTransaction.InsufficientPoints),
                    DomainErrorCodes.PointTransaction.InsufficientPoints
                ));
                return;
            }

            // Generate the code before the points transaction: the generator opens its own transaction.
            string code = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(PointTransaction), cancellationToken);

            string description = string.IsNullOrWhiteSpace(request.Input.Description)
                ? $"Redeemed: {reward.Title}"
                : request.Input.Description.Trim();

            SharedKernel.Results.DbResult<int> result = await _memberRepository.ApplyPointsAsync(
                request.MemberId,
                PointTransactionType.Redeemed,
                reward.PointsRequired,
                code,
                description,
                reward.Id,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    PointChangeErrors.Describe(result.Error),
                    result.Error ?? ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
