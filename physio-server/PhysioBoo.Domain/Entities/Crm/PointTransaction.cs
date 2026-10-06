namespace PhysioBoo.Domain.Entities.Crm
{
    // Append-only ledger row: no SetX methods on purpose. Corrections are new rows.
    public class PointTransaction : TenantEntity
    {
        #region Core PointTransaction Table (8)
        public string Code { get; private set; }
        public Guid MemberId { get; private set; }
        public PointTransactionType Type { get; private set; }
        public int Points { get; private set; }          // always positive, Type gives the sign
        public int BalanceAfter { get; private set; }
        public string Description { get; private set; }
        public Guid? RewardId { get; private set; }
        public DateTime OccurredAt { get; private set; }

        public virtual MemberPoint? Member { get; private set; }
        public virtual Reward? Reward { get; private set; }
        #endregion

        #region Constructor (8)
        public PointTransaction(
            Guid id,
            string code,
            Guid memberId,
            PointTransactionType type,
            int points,
            int balanceAfter,
            string description,
            Guid? rewardId
        ) : base(id)
        {
            Code = code;
            MemberId = memberId;
            Type = type;
            Points = points;
            BalanceAfter = balanceAfter;
            Description = description;
            RewardId = rewardId;
            OccurredAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion
    }
}
