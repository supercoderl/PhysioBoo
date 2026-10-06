namespace PhysioBoo.Application.ViewModels.Rewards
{
    public sealed record UpdateRewardViewModel(
        string Title,
        string? Description,
        int PointsRequired,
        string Category,
        bool Available
    );
}
