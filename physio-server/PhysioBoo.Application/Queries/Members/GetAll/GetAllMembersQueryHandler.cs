using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Members.GetAll
{
    public sealed class GetAllMembersQueryHandler : IRequestHandler<GetAllMembersQuery, PagedResult<MemberViewModel>>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly ISortingExpressionProvider<MemberViewModel, MemberPoint> _sortingExpressionProvider;

        public GetAllMembersQueryHandler(
            IMemberRepository memberRepository,
            ISortingExpressionProvider<MemberViewModel, MemberPoint> sortingExpressionProvider
        )
        {
            _memberRepository = memberRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<MemberViewModel>> Handle(GetAllMembersQuery q, CancellationToken cancellationToken)
        {
            MembersSearchSpec spec = new MembersSearchSpec(q, _sortingExpressionProvider);
            PagedResult<MemberPoint> paged = await _memberRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<MemberViewModel>(
                paged.TotalCount,
                paged.Items.Select(MemberViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
