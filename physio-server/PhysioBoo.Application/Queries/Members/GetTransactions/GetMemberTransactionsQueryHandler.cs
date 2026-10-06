using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Members.GetTransactions
{
    public sealed class GetMemberTransactionsQueryHandler : IRequestHandler<GetMemberTransactionsQuery, PagedResult<PointTransactionViewModel>>
    {
        private readonly IPointTransactionRepository _pointTransactionRepository;

        public GetMemberTransactionsQueryHandler(IPointTransactionRepository pointTransactionRepository)
        {
            _pointTransactionRepository = pointTransactionRepository;
        }

        public async Task<PagedResult<PointTransactionViewModel>> Handle(GetMemberTransactionsQuery q, CancellationToken cancellationToken)
        {
            MemberTransactionsSearchSpec spec = new MemberTransactionsSearchSpec(q);
            PagedResult<PointTransaction> paged = await _pointTransactionRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<PointTransactionViewModel>(
                paged.TotalCount,
                paged.Items.Select(PointTransactionViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
