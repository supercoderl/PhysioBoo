using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Admissions;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Admissions.GetAll
{
    public sealed class AdmissionsSearchSpec : Specification<Admission>
    {
        public AdmissionsSearchSpec(
            GetAllAdmissionsQuery q,
            ISortingExpressionProvider<AdmissionViewModel, Admission> sortingExpressionProvider
        )
        {
            // Names are shown in the result (no lazy loading)
            Query.Include(x => x.Patient!).ThenInclude(p => p.Profile);
            Query.Include(x => x.Department);
            Query.Include(x => x.Doctor!).ThenInclude(d => d.User!).ThenInclude(u => u.Profile);

            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.AdmissionNumber, pattern) ||
                    EF.Functions.ILike(x.Patient!.PatientNumber, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.FirstName, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.LastName, pattern)
                );
            }

            AdmissionFilter? filter = q.Request.Filter;
            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse(filter.Status, true, out AdmissionRecordStatus status))
                {
                    Query.Where(x => x.Status == status);
                }

                if (!string.IsNullOrEmpty(filter.Type) && Enum.TryParse(filter.Type, true, out AdmissionType type))
                {
                    Query.Where(x => x.AdmissionType == type);
                }

                if (filter.DepartmentId.HasValue)
                {
                    Query.Where(x => x.DepartmentId == filter.DepartmentId.Value);
                }

                if (filter.Start.HasValue)
                {
                    DateTime start = DateTime.SpecifyKind(filter.Start.Value.Date, DateTimeKind.Utc);
                    Query.Where(x => x.AdmittedAt >= start);
                }

                if (filter.End.HasValue)
                {
                    DateTime endExclusive = DateTime.SpecifyKind(filter.End.Value.Date.AddDays(1), DateTimeKind.Utc);
                    Query.Where(x => x.AdmittedAt < endExclusive);
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
