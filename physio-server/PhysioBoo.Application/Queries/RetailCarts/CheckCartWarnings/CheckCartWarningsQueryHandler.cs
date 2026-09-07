
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.CheckCartWarnings
{
    // Deliberately simple: only checks the patient's free-text AllergyInformation field for a
    // rough keyword match against the medicine names in the cart. No structured allergen/drug
    // interaction database is wired to Retail yet — same documented gap as the Prescriptions
    // module's CDS check (see docs/prescription-redesign.md §12.6).
    public sealed class CheckCartWarningsQueryHandler : IRequestHandler<CheckCartWarningsQuery, List<string>>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMedicineRepository _medicineRepository;

        public CheckCartWarningsQueryHandler(
            IPatientRepository patientRepository,
            IMedicineRepository medicineRepository
        )
        {
            _patientRepository = patientRepository;
            _medicineRepository = medicineRepository;
        }

        public async Task<List<string>> Handle(CheckCartWarningsQuery request, CancellationToken ct)
        {
            List<string> warnings = new List<string>();

            if (request.PatientId == null || request.MedicineIds.Count == 0) return warnings;

            Patient? patient = await _patientRepository.GetByIdAsync(request.PatientId.Value, ct: ct);

            if (patient == null || string.IsNullOrWhiteSpace(patient.AllergyInformation)) return warnings;

            foreach (Guid medicineId in request.MedicineIds)
            {
                Domain.Entities.Clinical.Medicine? medicine = await _medicineRepository.GetByIdAsync(medicineId, ct: ct);

                if (medicine == null) continue;

                bool nameMatchesAllergy = patient.AllergyInformation.Contains(medicine.Name, StringComparison.OrdinalIgnoreCase)
                    || (medicine.GenericName != null && patient.AllergyInformation.Contains(medicine.GenericName, StringComparison.OrdinalIgnoreCase));

                if (nameMatchesAllergy)
                {
                    warnings.Add($"Patient has a recorded allergy that may relate to {medicine.Name}: \"{patient.AllergyInformation}\" — verify before dispensing.");
                }
            }

            return warnings;
        }
    }
}
