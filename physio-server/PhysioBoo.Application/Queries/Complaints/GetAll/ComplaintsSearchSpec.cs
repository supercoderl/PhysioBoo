using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Application.Queries.Complaints.GetAll
{
    public sealed class ComplaintsSearchSpec : Specification<Complaint>
    {
        public ComplaintsSearchSpec(
            GetAllComplaintsQuery q,
            ISortingExpressionProvider<ComplaintViewModel, Complaint> sortingExpressionProvider
        )
        {
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.TicketNumber, pattern) ||
                    EF.Functions.ILike(x.PatientName, pattern) ||
                    EF.Functions.ILike(x.Subject, pattern) ||
                    EF.Functions.ILike(x.Email, pattern) ||
                    EF.Functions.ILike(x.Phone, pattern)
                );
            }

            ComplaintFilter? filter = q.Request.Filter;
            if (filter != null)
            {
                if (filter.Status.HasValue)
                {
                    Query.Where(x => x.Status == filter.Status.Value);
                }

                if (filter.Priority.HasValue)
                {
                    Query.Where(x => x.Priority == filter.Priority.Value);
                }

                if (filter.Category.HasValue)
                {
                    Query.Where(x => x.Category == filter.Category.Value);
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
