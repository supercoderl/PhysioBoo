using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.MedicalServices.GetAll
{
    public sealed class MedicalServicesSearchSpec : Specification<MedicalService>
    {
        public MedicalServicesSearchSpec(
            GetAllMedicalServicesQuery q,
            ISortingExpressionProvider<MedicalServiceViewModel, MedicalService> sortingExpressionProvider
        )
        {
            // Eager-load denormalized display fields (no lazy-loading proxies configured)
            Query.Include(x => x.Departments).ThenInclude(d => d.Department);
            Query.Include(x => x.PrimaryDoctor!).ThenInclude(d => d.User!).ThenInclude(u => u.Profile);

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

            // Archived services are hidden unless explicitly requested via the status filter.
            if (q.Request.Filter?.Status == null || !q.Request.Filter.Status.Any())
            {
                Query.Where(x => x.Status != ServiceStatus.Archived);
            }

            // Apply filter
            if (q.Request.Filter != null)
            {
                if (q.Request.Filter.DepartmentIds != null && q.Request.Filter.DepartmentIds.Any())
                {
                    Query.Where(x => x.Departments.Any(d => q.Request.Filter.DepartmentIds.Contains(d.DepartmentId)));
                }

                if (q.Request.Filter.DoctorIds != null && q.Request.Filter.DoctorIds.Any())
                {
                    Query.Where(x => x.Doctors.Any(d => q.Request.Filter.DoctorIds.Contains(d.DoctorId)));
                }

                if (q.Request.Filter.Status != null && q.Request.Filter.Status.Any())
                {
                    Query.Where(x => q.Request.Filter.Status.Contains(x.Status.ToString()));
                }

                if (q.Request.Filter.Availability != null && q.Request.Filter.Availability.Any())
                {
                    Query.Where(x => q.Request.Filter.Availability.Contains(x.Availability.ToString()));
                }

                if (q.Request.Filter.PriceMin.HasValue)
                {
                    Query.Where(x => x.BasePrice >= q.Request.Filter.PriceMin.Value);
                }

                if (q.Request.Filter.PriceMax.HasValue)
                {
                    Query.Where(x => x.BasePrice <= q.Request.Filter.PriceMax.Value);
                }

                if (q.Request.Filter.DurationMin.HasValue)
                {
                    Query.Where(x => x.DurationMinutes >= q.Request.Filter.DurationMin.Value);
                }

                if (q.Request.Filter.DurationMax.HasValue)
                {
                    Query.Where(x => x.DurationMinutes <= q.Request.Filter.DurationMax.Value);
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
