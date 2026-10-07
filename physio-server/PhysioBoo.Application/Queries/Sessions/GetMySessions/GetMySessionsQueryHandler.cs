using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Sessions;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Sessions.GetMySessions
{
    public sealed class GetMySessionsQueryHandler : IRequestHandler<GetMySessionsQuery, List<UserSessionViewModel>>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUser _user;

        public GetMySessionsQueryHandler(IRefreshTokenRepository refreshTokenRepository, IUser user)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _user = user;
        }

        public async Task<List<UserSessionViewModel>> Handle(GetMySessionsQuery request, CancellationToken ct)
        {
            Guid userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            var tokens = await _refreshTokenRepository
                .GetAllNoTracking(t => t.UserId == userId && t.ExpiresAt > now)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new { t.Id, t.Token, t.UserAgent, t.IpAddress, t.CreatedAt })
                .ToListAsync(ct);

            return tokens
                .Select(t =>
                {
                    (string device, string browser) = UserAgentParser.Parse(t.UserAgent);
                    bool current = !string.IsNullOrEmpty(request.CurrentRefreshToken) && t.Token == request.CurrentRefreshToken;
                    // Tokens rotate on every refresh, so creation time is the last activity.
                    return new UserSessionViewModel(t.Id, device, browser, t.IpAddress ?? string.Empty, string.Empty, t.CreatedAt, current);
                })
                .OrderByDescending(s => s.Current)
                .ThenByDescending(s => s.LastActiveAt)
                .ToList();
        }
    }
}
