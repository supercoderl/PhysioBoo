using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Members.GetTransactions
{
    public sealed class MemberTransactionsSearchSpec : Specification<PointTransaction>
    {
        public MemberTransactionsSearchSpec(GetMemberTransactionsQuery q)
        {
            Query.Include(x => x.Reward);

            Query.Where(x => x.MemberId == q.MemberId);

            PointTransactionFilter? filter = q.Request.Filter;
            if (filter != null && !string.IsNullOrEmpty(filter.Type) && Enum.TryParse(filter.Type, true, out PointTransactionType type))
            {
                Query.Where(x => x.Type == type);
            }

            // Ledger: newest first, fixed order (no client sorting)
            Query.OrderByDescending(x => x.OccurredAt);
        }
    }
}
