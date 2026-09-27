using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Leads.GetAll
{
    public sealed class LeadsSearchSpec : Specification<Lead>
    {
        public LeadsSearchSpec(
            GetAllLeadsQuery q,
            ISortingExpressionProvider<LeadViewModel, Lead> sortingExpressionProvider
        )
        {
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.Name, pattern) ||
                    EF.Functions.ILike(x.Email, pattern) ||
                    EF.Functions.ILike(x.Phone, pattern)
                );
            }

            LeadFilter? filter = q.Request.Filter;

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse(filter.Status, true, out LeadStatus status))
                {
                    Query.Where(x => x.Status == status);
                }

                if (!string.IsNullOrEmpty(filter.Priority) && Enum.TryParse(filter.Priority, true, out LeadPriority priority))
                {
                    Query.Where(x => x.Priority == priority);
                }

                if (filter.Start.HasValue)
                {
                    DateTime start = DateTime.SpecifyKind(filter.Start.Value.Date, DateTimeKind.Utc);
                    Query.Where(x => x.CreatedAt >= start);
                }

                if (filter.End.HasValue)
                {
                    DateTime endExclusive = DateTime.SpecifyKind(filter.End.Value.Date.AddDays(1), DateTimeKind.Utc);
                    Query.Where(x => x.CreatedAt < endExclusive);
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
