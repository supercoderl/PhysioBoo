using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Public.Services
{
    public sealed class GetPublicServiceQueryHandler : IRequestHandler<GetPublicServiceQuery, PublicServiceDetailViewModel?>
    {
        private const int MaxDoctors = 6;

        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IDoctorRepository _doctorRepository;

        public GetPublicServiceQueryHandler(
            IMedicalServiceRepository medicalServiceRepository,
            IHospitalRepository hospitalRepository,
            IDoctorRepository doctorRepository)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _hospitalRepository = hospitalRepository;
            _doctorRepository = doctorRepository;
        }

        public async Task<PublicServiceDetailViewModel?> Handle(GetPublicServiceQuery q, CancellationToken ct)
        {
            IQueryable<Hospital> hospitals = PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), q.TenantId);

            var row = await PublicServiceScope.Services(_medicalServiceRepository.GetAllNoTracking(), hospitals, q.TenantId)
                .Where(s => s.Id == q.ServiceId)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.CoverImage,
                    s.HospitalId,
                    s.PrimaryDoctorId,
                    Linked = s.Doctors.Select(x => x.DoctorId).ToList()
                })
                .FirstOrDefaultAsync(ct);

            if (row is null) return null;

            PublicHospitalViewModel? clinic = row.HospitalId is { } hospitalId
                ? (await SearchPublicHospitalsQueryHandler.ProjectAsync(hospitals.Where(h => h.Id == hospitalId), ct)).FirstOrDefault()
                : null;

            List<PublicDoctorViewModel> doctors = await DoctorsAsync(q.TenantId, row.PrimaryDoctorId, row.Linked, row.HospitalId, ct);

            return new PublicServiceDetailViewModel(
                row.Id,
                row.Name,
                PublicText.OrNull(row.Description),
                PublicText.OrNull(row.CoverImage),
                clinic,
                doctors
            );
        }

        // The primary doctor and linked doctors who are publicly listed; when the service has a clinic, only those
        // with a current schedule there. Primary doctor first, then by name.
        private async Task<List<PublicDoctorViewModel>> DoctorsAsync(
            Guid tenantId, Guid? primaryId, List<Guid> linkedIds, Guid? hospitalId, CancellationToken ct)
        {
            List<Guid> candidates = (primaryId is { } p ? linkedIds.Prepend(p) : linkedIds).Distinct().ToList();
            if (candidates.Count == 0) return new List<PublicDoctorViewModel>();

            IQueryable<Doctor> doctors = PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), tenantId)
                .Where(d => candidates.Contains(d.Id));

            if (hospitalId is { } clinicId)
            {
                Expression<Func<DoctorSchedule, bool>> activeSchedule = PublicDoctorScope.ActiveSchedule(tenantId, DateTime.Today);
                doctors = doctors.Where(d => d.Schedules.AsQueryable().Where(activeSchedule).Any(s => s.HospitalId == clinicId));
            }

            // Reuse the listing projection so the cards are identical to the doctors page.
            List<PublicDoctorViewModel> cards = await SearchPublicDoctorsQueryHandler.ProjectAsync(doctors, tenantId, ct);

            return cards
                .OrderByDescending(c => c.Id == primaryId)
                .ThenBy(c => c.FullName)
                .Take(MaxDoctors)
                .ToList();
        }
    }
}
