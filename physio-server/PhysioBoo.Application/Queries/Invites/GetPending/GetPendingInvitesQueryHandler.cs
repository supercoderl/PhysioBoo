using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Invites;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Invites.GetPending
{
    public sealed class GetPendingInvitesQueryHandler : IRequestHandler<GetPendingInvitesQuery, List<TenantInviteViewModel>>
    {
        // Invites are created valid for 7 days (CreateInviteCommandHandler); there is no created-at column.
        private const int InviteLifetimeDays = 7;

        private readonly ITenantInviteRepository _tenantInviteRepository;
        private readonly IUser _user;

        public GetPendingInvitesQueryHandler(ITenantInviteRepository tenantInviteRepository, IUser user)
        {
            _tenantInviteRepository = tenantInviteRepository;
            _user = user;
        }

        public async Task<List<TenantInviteViewModel>> Handle(GetPendingInvitesQuery request, CancellationToken ct)
        {
            // TenantInvite is not a TenantEntity, so scope to the caller's tenant explicitly.
            Guid tenantId = _user.GetTenantId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            var invites = await _tenantInviteRepository
                .GetAllNoTracking(i => i.TenantId == tenantId && !i.IsUsed && i.ExpiresAt > now)
                .OrderByDescending(i => i.ExpiresAt)
                .Select(i => new { i.Id, i.Email, i.IntendedRole, i.ExpiresAt })
                .ToListAsync(ct);

            return invites
                .Select(i => new TenantInviteViewModel(i.Id, i.Email, i.IntendedRole.ToString(), i.ExpiresAt.AddDays(-InviteLifetimeDays), i.ExpiresAt))
                .ToList();
        }
    }
}
