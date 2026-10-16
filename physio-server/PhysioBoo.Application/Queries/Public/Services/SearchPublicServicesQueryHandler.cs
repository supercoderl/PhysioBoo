using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Public.Services
{
    public sealed class SearchPublicServicesQueryHandler : IRequestHandler<SearchPublicServicesQuery, PagedResult<PublicServiceViewModel>>
    {
        // Same cap as the public doctor and clinic listings.
        private const int MaxPageSize = 24;
        private const int MaxSearchLength = 100;

        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IDoctorRepository _doctorRepository;

        public SearchPublicServicesQueryHandler(
            IMedicalServiceRepository medicalServiceRepository,
            IHospitalRepository hospitalRepository,
            IDoctorRepository doctorRepository)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _hospitalRepository = hospitalRepository;
            _doctorRepository = doctorRepository;
        }

        public async Task<PagedResult<PublicServiceViewModel>> Handle(SearchPublicServicesQuery q, CancellationToken ct)
        {
            int pageSize = Math.Clamp(q.Request.PageSize, 1, MaxPageSize);
            int pageNumber = Math.Max(1, q.Request.PageNumber);

            IQueryable<Hospital> hospitals = PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), q.TenantId);
            IQueryable<Doctor> doctors = PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), q.TenantId);
            Expression<Func<DoctorSchedule, bool>> activeSchedule = PublicDoctorScope.ActiveSchedule(q.TenantId, DateTime.Today);
            IQueryable<MedicalService> query = PublicServiceScope.Services(_medicalServiceRepository.GetAllNoTracking(), hospitals, q.TenantId);

            string? search = q.Request.Search?.Trim();
            if (!string.IsNullOrEmpty(search))
            {
                string pattern = "%" + EscapeLike(search.Length > MaxSearchLength ? search[..MaxSearchLength] : search) + "%";
                query = query.Where(s =>
                    EF.Functions.ILike(
                        EF.Functions.Unaccent(s.Name + " " + (s.Description ?? "")),
                        EF.Functions.Unaccent(pattern)));
            }

            if (q.Request.Filter?.HospitalId is { } hospitalId)
            {
                query = query.Where(s => s.HospitalId == hospitalId);
            }

            int total = await query.CountAsync(ct);

            var rows = await query
                .OrderBy(s => s.Name)
                .ThenBy(s => s.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.CoverImage,
                    s.HospitalId,
                    HospitalName = hospitals.Where(h => h.Id == s.HospitalId).Select(h => h.Name).FirstOrDefault(),
                    // Requests are made per doctor: the primary doctor when public, else the first public linked doctor.
                    // Same rule as the detail page: at a clinic, only doctors with a current schedule there.
                    PrimaryDoctorId = doctors.Any(d => d.Id == s.PrimaryDoctorId &&
                        (s.HospitalId == null || d.Schedules.AsQueryable().Where(activeSchedule).Any(x => x.HospitalId == s.HospitalId)))
                        ? s.PrimaryDoctorId
                        : null,
                    LinkedDoctorId = s.Doctors
                        .Where(x => doctors.Any(d => d.Id == x.DoctorId &&
                            (s.HospitalId == null || d.Schedules.AsQueryable().Where(activeSchedule).Any(y => y.HospitalId == s.HospitalId))))
                        .OrderBy(x => x.DoctorId)
                        .Select(x => (Guid?)x.DoctorId)
                        .FirstOrDefault()
                })
                .ToListAsync(ct);

            List<PublicServiceViewModel> items = rows.Select(r => new PublicServiceViewModel(
                r.Id,
                r.Name,
                PublicText.OrNull(r.Description),
                PublicText.OrNull(r.CoverImage),
                r.HospitalName is null ? null : r.HospitalId,
                PublicText.OrNull(r.HospitalName),
                r.PrimaryDoctorId ?? r.LinkedDoctorId
            )).ToList();

            return new PagedResult<PublicServiceViewModel>(total, items, pageNumber, pageSize);
        }

        // The search text is a literal, not a LIKE pattern.
        private static string EscapeLike(string value) =>
            value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
