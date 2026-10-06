namespace PhysioBoo.Application.ViewModels.Rewards
{
    public sealed record RewardFilter(
        string? Category,
        bool? Available
    );
}
