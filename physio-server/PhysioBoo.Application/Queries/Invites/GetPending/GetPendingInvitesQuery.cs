using PhysioBoo.Application.ViewModels.Invites;

namespace PhysioBoo.Application.Queries.Invites.GetPending
{
    public sealed record GetPendingInvitesQuery() : IRequest<List<TenantInviteViewModel>>;
}
