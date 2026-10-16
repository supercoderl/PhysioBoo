using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    public sealed class GetPublicDoctorQueryHandler : IRequestHandler<GetPublicDoctorQuery, PublicDoctorDetailViewModel?>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public GetPublicDoctorQueryHandler(IDoctorRepository doctorRepository, IMedicalServiceRepository medicalServiceRepository)
        {
            _doctorRepository = doctorRepository;
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task<PublicDoctorDetailViewModel?> Handle(GetPublicDoctorQuery q, CancellationToken ct)
        {
            var row = await PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), q.TenantId)
                .Where(d => d.Id == q.DoctorId)
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
                    d.IsVerified,
                    d.Bio,
                    d.About,
                    d.ResearchInterests,
                    d.Archivements,
                    d.YearsOfExperience,
                    d.LanguagesSpoken,
                    d.IsAvailableOnline,
                    d.IsAvailableHomeVisit
                })
                .FirstOrDefaultAsync(ct);

            if (row is null) return null;

            List<PublicFacilityViewModel> facilities = await PublicDoctorFacilities.ForDoctorAsync(_doctorRepository, q.TenantId, q.DoctorId, ct);

            List<PublicDoctorServiceViewModel> services = await PublicDoctorScope
                .ServicesOf(_medicalServiceRepository.GetAllNoTracking(), q.TenantId, q.DoctorId)
                .OrderBy(s => s.Name)
                .Select(s => new PublicDoctorServiceViewModel(s.Id, s.Name, s.HospitalId))
                .ToListAsync(ct);

            return new PublicDoctorDetailViewModel(
                row.Id,
                PublicText.FullName(row.FirstName, row.MiddleName, row.LastName),
                PublicText.OrNull(row.Avatar),
                row.Specialty,
                row.IsVerified,
                PublicText.OrNull(row.Bio),
                PublicText.OrNull(row.About),
                PublicText.OrNull(row.ResearchInterests),
                row.IsVerified ? PublicText.OrNull(row.Archivements) : null,
                row.IsVerified && row.YearsOfExperience > 0 ? row.YearsOfExperience : null,
                (row.LanguagesSpoken ?? Array.Empty<string>()).Where(l => !string.IsNullOrWhiteSpace(l)).Select(l => l.Trim()).Distinct().ToList(),
                row.IsAvailableOnline,
                row.IsAvailableHomeVisit,
                services.Select(s => s.Name).Distinct().ToList(),
                facilities,
                services
            );
        }
    }

    public sealed class GetRelatedPublicDoctorsQueryHandler : IRequestHandler<GetRelatedPublicDoctorsQuery, List<PublicDoctorViewModel>>
    {
        private const int MaxRelated = 3;

        private readonly IDoctorRepository _doctorRepository;

        public GetRelatedPublicDoctorsQueryHandler(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        // Other verified doctors who share a specialty or a current facility with this one.
        public async Task<List<PublicDoctorViewModel>> Handle(GetRelatedPublicDoctorsQuery q, CancellationToken ct)
        {
            var activeSchedule = PublicDoctorScope.ActiveSchedule(q.TenantId, DateTime.Today);
            IQueryable<Doctor> doctors = PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), q.TenantId);

            var self = await doctors
                .Where(d => d.Id == q.DoctorId)
                .Select(d => new
                {
                    Specialties = d.Specialties.Where(s => s.DeletedAt == null).Select(s => s.SpecialtyId).ToList(),
                    Hospitals = d.Schedules.AsQueryable().Where(activeSchedule).Select(s => s.HospitalId).ToList()
                })
                .FirstOrDefaultAsync(ct);

            if (self is null || (self.Specialties.Count == 0 && self.Hospitals.Count == 0)) return new List<PublicDoctorViewModel>();

            List<Guid> ids = await doctors
                .Where(d => d.Id != q.DoctorId && d.IsVerified)
                .Where(d =>
                    d.Specialties.Any(s => s.DeletedAt == null && self.Specialties.Contains(s.SpecialtyId)) ||
                    d.Schedules.AsQueryable().Where(activeSchedule).Any(s => self.Hospitals.Contains(s.HospitalId)))
                // Same specialty first, then featured.
                .OrderByDescending(d => d.Specialties.Any(s => s.DeletedAt == null && self.Specialties.Contains(s.SpecialtyId)))
                .ThenByDescending(d => d.IsFeatured)
                .ThenBy(d => d.Id)
                .Select(d => d.Id)
                .Take(MaxRelated)
                .ToListAsync(ct);

            if (ids.Count == 0) return new List<PublicDoctorViewModel>();

            // Reuse the listing projection so the cards are identical to the doctors page.
            List<PublicDoctorViewModel> cards = await SearchPublicDoctorsQueryHandler.ProjectAsync(
                doctors.Where(d => ids.Contains(d.Id)), q.TenantId, ct);

            return ids.Select(id => cards.FirstOrDefault(c => c.Id == id)).Where(c => c != null).Select(c => c!).ToList();
        }
    }

    internal static class PublicDoctorFacilities
    {
        public static async Task<List<PublicFacilityViewModel>> ForDoctorAsync(
            IDoctorRepository doctorRepository, Guid tenantId, Guid doctorId, CancellationToken ct)
        {
            var activeSchedule = PublicDoctorScope.ActiveSchedule(tenantId, DateTime.Today);

            var rows = await PublicDoctorScope.Doctors(doctorRepository.GetAllNoTracking(), tenantId)
                .Where(d => d.Id == doctorId)
                .SelectMany(d => d.Schedules.AsQueryable().Where(activeSchedule))
                .Select(s => new { s.Hospital!.Id, s.Hospital.Name, s.Hospital.Address, s.Hospital.City, s.Hospital.Phone })
                .Distinct()
                .ToListAsync(ct);

            return rows
                .OrderBy(h => h.Name)
                .Select(h => new PublicFacilityViewModel(
                    h.Id,
                    h.Name,
                    PublicText.OrNull(string.Join(", ", new[] { h.Address, h.City }.Where(p => !string.IsNullOrWhiteSpace(p)))),
                    PublicText.OrNull(h.Phone)))
                .ToList();
        }
    }

    internal static class PublicText
    {
        public static string? OrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        public static string FullName(string? first, string? middle, string? last) =>
            string.Join(' ', new[] { first, middle, last }.Where(p => !string.IsNullOrWhiteSpace(p)).Select(p => p!.Trim()));
    }
}
