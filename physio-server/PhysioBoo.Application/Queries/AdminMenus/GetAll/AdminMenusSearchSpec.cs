using Ardalis.Specification;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Queries.AdminMenus.GetAll
{
    public sealed class AdminMenusSearchSpec : Specification<AdminMenu>
    {
        public AdminMenusSearchSpec(
            GetAllAdminMenusQuery q,
            ISortingExpressionProvider<AdminMenuViewModel, AdminMenu> sortingExpressionProvider
        )
        {
            // Apply filters
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string[] terms = q.Request.Search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

                if (terms.Length > 0)
                {
                    string searchTerm = string.Join(" & ", terms.Select(t => $"{t}:*"));

                    Query.Where(x => x.SearchVector != null && x.SearchVector.Matches(
                        EF.Functions.ToTsQuery("english", EF.Functions.Unaccent(searchTerm))
                    ));
                }
            }

            // Apply filter
            if (q.Request.Filter != null)
            {
                if (q.Request.Filter.IsActive.HasValue)
                {
                    Query.Where(x => q.Request.Filter.IsActive.Value);
                }
            }

            // Apply sorting
            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
