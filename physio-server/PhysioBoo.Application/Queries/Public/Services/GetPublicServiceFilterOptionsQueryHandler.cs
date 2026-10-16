using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Public.Services
{
    // Clinic choices for the public service listing: only clinics with at least one published service,
    // so no option leads to an empty result by construction.
    public sealed class GetPublicServiceFilterOptionsQueryHandler : IRequestHandler<GetPublicServiceFilterOptionsQuery, PublicServiceFilterOptionsViewModel>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IHospitalRepository _hospitalRepository;

        public GetPublicServiceFilterOptionsQueryHandler(IMedicalServiceRepository medicalServiceRepository, IHospitalRepository hospitalRepository)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _hospitalRepository = hospitalRepository;
        }

        public async Task<PublicServiceFilterOptionsViewModel> Handle(GetPublicServiceFilterOptionsQuery q, CancellationToken ct)
        {
            IQueryable<Hospital> hospitals = PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), q.TenantId);
            IQueryable<MedicalService> services = PublicServiceScope.Services(_medicalServiceRepository.GetAllNoTracking(), hospitals, q.TenantId);

            List<PublicOption> clinics = await hospitals
                .Where(h => services.Any(s => s.HospitalId == h.Id))
                .OrderBy(h => h.Name)
                .Select(h => new PublicOption(h.Id, h.Name))
                .ToListAsync(ct);

            return new PublicServiceFilterOptionsViewModel(clinics);
        }
    }
}
