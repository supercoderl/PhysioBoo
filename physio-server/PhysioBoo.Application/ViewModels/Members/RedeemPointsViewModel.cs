namespace PhysioBoo.Application.ViewModels.Members
{
    // Points deducted = Reward.PointsRequired, so the client never sends an amount.
    public sealed record RedeemPointsViewModel(
        Guid RewardId,
        string? Description
    );
}
