namespace PhysioBoo.Application.ViewModels.Members
{
    public sealed class MemberStatsViewModel
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int NewMembersThisMonth { get; set; }
        public long PointsDistributedThisMonth { get; set; }
        public int RewardsRedeemedThisMonth { get; set; }
    }
}
