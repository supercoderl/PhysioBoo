
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.SearchPatients
{
    public sealed class SearchPatientsQueryHandler : IRequestHandler<SearchPatientsQuery, List<RetailCustomerViewModel>>
    {
        private readonly IPatientRepository _patientRepository;

        public SearchPatientsQueryHandler(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<List<RetailCustomerViewModel>> Handle(SearchPatientsQuery request, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.Query)) return new List<RetailCustomerViewModel>();

            string term = request.Query.Trim().ToLower();

            List<Patient> patients = await _patientRepository
                .GetAllNoTracking(includeProperties: "Profile")
                .Where(p => p.PatientNumber.ToLower().Contains(term)
                    || (p.Profile != null && p.Profile.Phone != null && p.Profile.Phone.Contains(term))
                    || (p.Profile != null && (p.Profile.FirstName + " " + p.Profile.LastName).ToLower().Contains(term)))
                .Take(20)
                .ToListAsync(ct);

            return patients.Select(p => new RetailCustomerViewModel
            {
                Type = "Patient",
                PatientId = p.Id,
                FullName = p.Profile?.FullName ?? string.Empty,
                Phone = p.Profile?.Phone ?? string.Empty,
                Mrn = p.PatientNumber,
                InsuranceProvider = p.InssuranceProvider,
                InsuranceCoverageAmount = p.InssuranceCoverageAmount,
                AllergyInformation = p.AllergyInformation
            }).ToList();
        }
    }
}
