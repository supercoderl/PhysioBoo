using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.BedMap.SearchBeds
{
    public sealed class BedsSearchSpec : Specification<Bed>
    {
        public BedsSearchSpec(
            SearchBedsQuery q,
            ISortingExpressionProvider<BedViewModel, Bed> sortingExpressionProvider
        )
        {
            // Ward name and the occupying patient are shown in the result (no lazy loading)
            Query.Include(x => x.Ward!);
            Query.Include(x => x.CurrentAssignment!).ThenInclude(a => a.Patient!).ThenInclude(p => p.Profile);

            BedFilter? filter = q.Request.Filter;

            // The search box can arrive at the top level or inside the filter.
            string? search = !string.IsNullOrWhiteSpace(q.Request.Search) ? q.Request.Search : filter?.Search;
            if (!string.IsNullOrWhiteSpace(search))
            {
                string pattern = $"%{search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.Number, pattern) ||
                    EF.Functions.ILike(x.Ward!.Name, pattern) ||
                    (x.CurrentAssignment != null && (
                        EF.Functions.ILike(x.CurrentAssignment.Patient!.PatientNumber, pattern) ||
                        EF.Functions.ILike(x.CurrentAssignment.Patient!.Profile!.FirstName, pattern) ||
                        EF.Functions.ILike(x.CurrentAssignment.Patient!.Profile!.LastName, pattern)))
                );
            }

            if (filter != null)
            {
                if (filter.WardId.HasValue)
                {
                    Query.Where(x => x.WardId == filter.WardId.Value);
                }

                if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse(filter.Status, true, out BedStatus status))
                {
                    Query.Where(x => x.Status == status);
                }

                if (filter.Floor.HasValue)
                {
                    Query.Where(x => x.Floor == filter.Floor.Value);
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
