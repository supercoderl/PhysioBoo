namespace PhysioBoo.Application.ViewModels.RefreshTokens
{
    public sealed record CreateRefreshTokenViewModel
    (
        Guid Id,
        Guid UserId,
        string Token,
        DateTime ExpiresAt
    );
}
