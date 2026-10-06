using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Queries.Members.GetStats
{
    public sealed record GetMemberStatsQuery : IRequest<MemberStatsViewModel>;
}
