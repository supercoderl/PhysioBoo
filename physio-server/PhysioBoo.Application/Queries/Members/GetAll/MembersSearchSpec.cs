using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Members.GetAll
{
    public sealed class MembersSearchSpec : Specification<MemberPoint>
    {
        public MembersSearchSpec(
            GetAllMembersQuery q,
            ISortingExpressionProvider<MemberViewModel, MemberPoint> sortingExpressionProvider
        )
        {
            // Name, email, phone and last visit live on Patient/Profile (no lazy loading)
            Query.Include(x => x.Patient!).ThenInclude(p => p.Profile);

            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.MemberNumber, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.FirstName, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.LastName, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.Email!, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.Phone!, pattern)
                );
            }

            MemberFilter? filter = q.Request.Filter;
            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Tier) && Enum.TryParse(filter.Tier, true, out MembershipTier tier))
                {
                    Query.Where(x => x.Tier == tier);
                }

                if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse(filter.Status, true, out MemberStatus status))
                {
                    Query.Where(x => x.Status == status);
                }
            }

            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
