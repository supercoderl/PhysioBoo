using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Members.GetAll
{
    public sealed record GetAllMembersQuery(PagedRequest<MemberFilter> Request) : IRequest<PagedResult<MemberViewModel>>;
}
