
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Articles.GetAll
{
    public sealed class ArticlesSearchSpec : Specification<Article>
    {
        public ArticlesSearchSpec(
            GetAllArticlesQuery q,
            ISortingExpressionProvider<ArticleViewModel, Article> sortingExpressionProvider
        )
        {
            // Apply search
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
                if (!string.IsNullOrEmpty(q.Request.Filter.Start) && !string.IsNullOrEmpty(q.Request.Filter.End))
                {
                    if (DateOnly.TryParse(q.Request.Filter.Start, out DateOnly startDate) &&
                            DateOnly.TryParse(q.Request.Filter.End, out DateOnly endDate))
                    {
                        DateTime fromDate = startDate.ToDateTime(TimeOnly.MinValue);
                        DateTime toDate = endDate.AddDays(1).ToDateTime(TimeOnly.MinValue);
                        Query.Where(x => x.CreatedAt >= fromDate && x.CreatedAt < toDate);
                    }
                }

                if (q.Request.Filter.Category.HasValue)
                {
                    Query.Where(x => x.Category == q.Request.Filter.Category.Value);
                }

                if (q.Request.Filter.Status.HasValue)
                {
                    Query.Where(x => x.Status == q.Request.Filter.Status.Value);
                }
                else
                {
                    // Public/anonymous callers (no explicit status filter) only see Published articles.
                    // Draft/Archived content is staff-only and must be requested explicitly.
                    Query.Where(x => x.Status == ArticleStatus.Published);
                }
            }
            else
            {
                Query.Where(x => x.Status == ArticleStatus.Published);
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
