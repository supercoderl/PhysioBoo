using PhysioBoo.Application.ViewModels.Sessions;

namespace PhysioBoo.Application.Queries.Sessions.GetMySessions
{
    /// <param name="CurrentRefreshToken">The caller's refresh_token cookie, used to flag the current session.</param>
    public sealed record GetMySessionsQuery(string? CurrentRefreshToken) : IRequest<List<UserSessionViewModel>>;
}
