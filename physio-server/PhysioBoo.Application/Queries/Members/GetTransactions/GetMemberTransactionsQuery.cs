using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Members.GetTransactions
{
    public sealed record GetMemberTransactionsQuery(
        Guid MemberId,
        PagedRequest<PointTransactionFilter> Request
    ) : IRequest<PagedResult<PointTransactionViewModel>>;
}
