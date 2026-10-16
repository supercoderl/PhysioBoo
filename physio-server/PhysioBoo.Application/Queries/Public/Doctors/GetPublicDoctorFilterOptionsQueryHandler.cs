using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    // Filter choices for the public doctor listing: only specialties and facilities that at least one
    // publicly listed doctor actually has, so no option leads to an empty result by construction.
    public sealed class GetPublicDoctorFilterOptionsQueryHandler : IRequestHandler<GetPublicDoctorFilterOptionsQuery, PublicDoctorFilterOptionsViewModel>
    {
        private readonly IDoctorRepository _doctorRepository;

        public GetPublicDoctorFilterOptionsQueryHandler(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task<PublicDoctorFilterOptionsViewModel> Handle(GetPublicDoctorFilterOptionsQuery q, CancellationToken ct)
        {
            Expression<Func<DoctorSchedule, bool>> activeSchedule = PublicDoctorScope.ActiveSchedule(q.TenantId, DateTime.Today);
            IQueryable<Doctor> doctors = PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), q.TenantId);

            List<PublicOption> specialties = await doctors
                .SelectMany(d => d.Specialties)
                .Where(ds => ds.DeletedAt == null && ds.Specialty != null && ds.Specialty.DeletedAt == null)
                .Select(ds => new { ds.Specialty!.Id, ds.Specialty.Name })
                .Distinct()
                .OrderBy(s => s.Name)
                .Select(s => new PublicOption(s.Id, s.Name))
                .ToListAsync(ct);

            List<PublicOption> facilities = await doctors
                .SelectMany(d => d.Schedules.AsQueryable().Where(activeSchedule))
                .Select(s => new { s.Hospital!.Id, s.Hospital.Name })
                .Distinct()
                .OrderBy(h => h.Name)
                .Select(h => new PublicOption(h.Id, h.Name))
                .ToListAsync(ct);

            return new PublicDoctorFilterOptionsViewModel(specialties, facilities);
        }
    }
}
