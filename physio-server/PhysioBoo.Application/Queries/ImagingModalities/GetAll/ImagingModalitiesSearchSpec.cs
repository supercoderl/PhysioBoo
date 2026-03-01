using Ardalis.Specification;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.Queries.ImagingModalities.GetAll
{
    public sealed class ImagingModalitiesSearchSpec : Specification<ImagingModality>
    {
        public ImagingModalitiesSearchSpec(
            GetAllImagingModalitiesQuery q,
            ISortingExpressionProvider<ImagingModalityViewModel, ImagingModality> sortingExpressionProvider
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

                if (q.Request.Filter.RequiresContrast.HasValue)
                {
                    Query.Where(x => q.Request.Filter.RequiresContrast.Value);
                }
                if (q.Request.Filter.PreparationRequired.HasValue)
                {
                    Query.Where(x => q.Request.Filter.PreparationRequired.Value);
                }
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
