namespace PhysioBoo.Application.ViewModels.Rewards
{
    public sealed record CreateRewardViewModel(
        string Title,
        string? Description,
        int PointsRequired,
        string Category
    );
}
