using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Members.GetStats
{
    public sealed class GetMemberStatsQueryHandler : IRequestHandler<GetMemberStatsQuery, MemberStatsViewModel>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IPointTransactionRepository _pointTransactionRepository;

        public GetMemberStatsQueryHandler(
            IMemberRepository memberRepository,
            IPointTransactionRepository pointTransactionRepository
        )
        {
            _memberRepository = memberRepository;
            _pointTransactionRepository = pointTransactionRepository;
        }

        public async Task<MemberStatsViewModel> Handle(GetMemberStatsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime monthStart = new DateTime(now.Year, now.Month, 1);

            IQueryable<MemberPoint> members = _memberRepository.GetAllNoTracking();
            IQueryable<PointTransaction> transactions = _pointTransactionRepository.GetAllNoTracking();

            return new MemberStatsViewModel
            {
                TotalMembers = await members.CountAsync(cancellationToken),
                ActiveMembers = await members.CountAsync(m => m.Status == MemberStatus.Active, cancellationToken),
                NewMembersThisMonth = await members.CountAsync(m => m.JoinedAt >= monthStart, cancellationToken),
                PointsDistributedThisMonth = await transactions
                    .Where(t => t.Type == PointTransactionType.Earned && t.OccurredAt >= monthStart)
                    .SumAsync(t => (long)t.Points, cancellationToken),
                RewardsRedeemedThisMonth = await transactions
                    .CountAsync(t => t.Type == PointTransactionType.Redeemed && t.RewardId != null && t.OccurredAt >= monthStart, cancellationToken)
            };
        }
    }
}
