using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Public.Hospitals
{
    public sealed class GetPublicHospitalQueryHandler : IRequestHandler<GetPublicHospitalQuery, PublicHospitalDetailViewModel?>
    {
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public GetPublicHospitalQueryHandler(IHospitalRepository hospitalRepository, IMedicalServiceRepository medicalServiceRepository)
        {
            _hospitalRepository = hospitalRepository;
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task<PublicHospitalDetailViewModel?> Handle(GetPublicHospitalQuery q, CancellationToken ct)
        {
            var row = await PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), q.TenantId)
                .Where(h => h.Id == q.HospitalId)
                .Select(h => new
                {
                    h.Id,
                    h.Name,
                    h.HospitalType,
                    h.Address,
                    h.City,
                    h.StateProvince,
                    h.Phone,
                    h.Email,
                    h.Website,
                    h.Description,
                    h.LogoUrl,
                    h.Images,
                    h.Is24Hours,
                    h.LanguagesSupported
                })
                .FirstOrDefaultAsync(ct);

            if (row is null) return null;

            List<string> services = await PublicHospitalScope
                .ServicesAt(_medicalServiceRepository.GetAllNoTracking(), q.TenantId, q.HospitalId)
                .OrderBy(s => s.Name)
                .Select(s => s.Name)
                .ToListAsync(ct);

            return new PublicHospitalDetailViewModel(
                row.Id,
                row.Name,
                row.HospitalType,
                PublicText.OrNull(row.Address),
                PublicText.OrNull(row.City),
                PublicText.OrNull(row.StateProvince),
                PublicText.OrNull(row.Phone),
                PublicText.OrNull(row.Email),
                PublicHospitalScope.WebUrl(row.Website),
                PublicText.OrNull(row.Description),
                PublicHospitalScope.WebUrl(row.LogoUrl),
                PublicHospitalScope.FirstImage(row.Images),
                row.Is24Hours,
                PublicHospitalScope.Languages(row.LanguagesSupported),
                services.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList()
            );
        }
    }
}
