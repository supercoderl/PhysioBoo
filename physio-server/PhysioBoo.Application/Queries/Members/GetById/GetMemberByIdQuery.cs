using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Queries.Members.GetById
{
    public sealed record GetMemberByIdQuery(Guid Id) : IRequest<MemberViewModel?>;
}
