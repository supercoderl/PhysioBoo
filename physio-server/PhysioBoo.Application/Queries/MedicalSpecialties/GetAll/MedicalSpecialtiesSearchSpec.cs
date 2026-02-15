using Ardalis.Specification;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetAll
{
    public sealed class MedicalSpecialtiesSearchSpec : Specification<MedicalSpecialty>
    {
        public MedicalSpecialtiesSearchSpec(
            GetAllMedicalSpecialtiesQuery q,
            ISortingExpressionProvider<MedicalSpecialtyViewModel, MedicalSpecialty> sortingExpressionProvider
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

                if (q.Request.Filter.IsSurgical.HasValue)
                {
                    Query.Where(x => q.Request.Filter.IsSurgical.Value ? x.IsSurgical : x.IsDiagnostic);
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
