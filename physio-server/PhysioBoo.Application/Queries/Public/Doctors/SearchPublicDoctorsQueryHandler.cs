using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    public sealed class SearchPublicDoctorsQueryHandler : IRequestHandler<SearchPublicDoctorsQuery, PagedResult<PublicDoctorViewModel>>
    {
        // The public listing pages in small steps; larger pages would only make scraping cheaper.
        private const int MaxPageSize = 24;
        private const int MaxSearchLength = 100;

        private readonly IDoctorRepository _doctorRepository;

        public SearchPublicDoctorsQueryHandler(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task<PagedResult<PublicDoctorViewModel>> Handle(SearchPublicDoctorsQuery q, CancellationToken ct)
        {
            int pageSize = Math.Clamp(q.Request.PageSize, 1, MaxPageSize);
            int pageNumber = Math.Max(1, q.Request.PageNumber);
            DateTime today = DateTime.Today;
            Expression<Func<DoctorSchedule, bool>> activeSchedule = PublicDoctorScope.ActiveSchedule(q.TenantId, today);

            IQueryable<Doctor> query = PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), q.TenantId);

            string? search = q.Request.Search?.Trim();
            if (!string.IsNullOrEmpty(search))
            {
                string pattern = "%" + EscapeLike(search.Length > MaxSearchLength ? search[..MaxSearchLength] : search) + "%";
                query = query.Where(d =>
                    EF.Functions.ILike(
                        EF.Functions.Unaccent(d.User!.Profile!.FirstName + " " + d.User.Profile.LastName),
                        EF.Functions.Unaccent(pattern)) ||
                    d.Specialties.Any(ds => ds.DeletedAt == null && ds.Specialty != null &&
                        EF.Functions.ILike(EF.Functions.Unaccent(ds.Specialty.Name), EF.Functions.Unaccent(pattern))));
            }

            PublicDoctorFilter? filter = q.Request.Filter;
            if (filter?.SpecialtyId is Guid specialtyId)
            {
                query = query.Where(d => d.Specialties.Any(ds => ds.DeletedAt == null && ds.SpecialtyId == specialtyId));
            }
            if (filter?.HospitalId is Guid hospitalId)
            {
                query = query.Where(d => d.Schedules.AsQueryable().Where(activeSchedule).Any(s => s.HospitalId == hospitalId));
            }
            if (filter?.Online == true)
            {
                query = query.Where(d => d.IsAvailableOnline);
            }
            if (filter?.HomeVisit == true)
            {
                query = query.Where(d => d.IsAvailableHomeVisit);
            }

            int total = await query.CountAsync(ct);

            IQueryable<Doctor> page = query
                .OrderByDescending(d => d.IsFeatured)
                .ThenByDescending(d => d.IsVerified)
                .ThenBy(d => d.User!.Profile!.FirstName)
                .ThenBy(d => d.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            List<PublicDoctorViewModel> items = await ProjectAsync(page, q.TenantId, ct);

            return new PagedResult<PublicDoctorViewModel>(total, items, pageNumber, pageSize);
        }

        /// <summary>Public card fields for the given doctors, in the query's order. Shared with related doctors.</summary>
        internal static async Task<List<PublicDoctorViewModel>> ProjectAsync(IQueryable<Doctor> doctors, Guid tenantId, CancellationToken ct)
        {
            Expression<Func<DoctorSchedule, bool>> activeSchedule = PublicDoctorScope.ActiveSchedule(tenantId, DateTime.Today);

            var rows = await doctors
                .Select(d => new
                {
                    d.Id,
                    FirstName = d.User!.Profile!.FirstName,
                    MiddleName = d.User.Profile.MiddleName,
                    LastName = d.User.Profile.LastName,
                    Avatar = d.User.ProfilePicture,
                    Specialty = d.PrimarySpecialty != null && d.PrimarySpecialty.Specialty != null
                        ? d.PrimarySpecialty.Specialty.Name
                        : null,
                    Facilities = d.Schedules.AsQueryable().Where(activeSchedule).Select(s => s.Hospital!.Name).ToList(),
                    d.Bio,
                    d.IsVerified,
                    d.YearsOfExperience,
                    d.IsAvailableOnline,
                    d.IsAvailableHomeVisit
                })
                .ToListAsync(ct);

            return rows.Select(r => new PublicDoctorViewModel(
                r.Id,
                PublicText.FullName(r.FirstName, r.MiddleName, r.LastName),
                PublicText.OrNull(r.Avatar),
                r.Specialty,
                r.Facilities.Distinct().OrderBy(n => n).ToList(),
                PublicText.OrNull(r.Bio),
                r.IsVerified,
                r.IsVerified && r.YearsOfExperience > 0 ? r.YearsOfExperience : null,
                r.IsAvailableOnline,
                r.IsAvailableHomeVisit
            )).ToList();
        }

        // The search text is a literal, not a LIKE pattern.
        private static string EscapeLike(string value) =>
            value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
