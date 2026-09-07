using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Prescriptions.CheckClinicalWarnings
{
    public sealed class CheckClinicalWarningsQueryHandler
        : IRequestHandler<CheckClinicalWarningsQuery, Dictionary<Guid, List<ClinicalWarningViewModel>>>
    {
        private readonly IPatientAllergyRepository _patientAllergyRepository;
        private readonly IPrescriptionRepository _prescriptionRepository;

        public CheckClinicalWarningsQueryHandler(
            IPatientAllergyRepository patientAllergyRepository,
            IPrescriptionRepository prescriptionRepository
        )
        {
            _patientAllergyRepository = patientAllergyRepository;
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<Dictionary<Guid, List<ClinicalWarningViewModel>>> Handle(
            CheckClinicalWarningsQuery request, CancellationToken ct)
        {
            Dictionary<Guid, List<ClinicalWarningViewModel>> result = request.Items.ToDictionary(i => i.ItemKey, _ => new List<ClinicalWarningViewModel>());

            if (request.Items.Count == 0)
            {
                return result;
            }

            List<PatientAllergy> activeAllergies = await _patientAllergyRepository
                .GetAllNoTracking(a => a.PatientId == request.PatientId && a.IsActive)
                .ToListAsync(ct);

            List<Prescription> otherActivePrescriptions = await _prescriptionRepository
                .GetAllNoTracking(
                    p => p.PatientId == request.PatientId
                        && p.Status == PrescriptionStatus.Issued
                        && (request.ExcludePrescriptionId == null || p.Id != request.ExcludePrescriptionId),
                    includeProperties: "PrescriptionItems")
                .ToListAsync(ct);

            HashSet<Guid> existingActiveMedicineIds = otherActivePrescriptions
                .SelectMany(p => p.PrescriptionItems)
                .Select(i => i.MedicineId)
                .ToHashSet();

            foreach (CdsCheckItemInput item in request.Items)
            {
                List<ClinicalWarningViewModel> warnings = result[item.ItemKey];

                // 1. Allergy cross-reference: simple case-insensitive name match against the
                // patient's recorded allergens. This will not catch drug-class-level allergies
                // (e.g. "Penicillin family" vs "Amoxicillin") without a drug-class mapping table
                // — flagged as a known limitation for a future pass.
                foreach (PatientAllergy allergy in activeAllergies)
                {
                    bool matchesName =
                        item.MedicineName.Contains(allergy.AllergenName, StringComparison.OrdinalIgnoreCase) ||
                        (item.GenericName != null && item.GenericName.Contains(allergy.AllergenName, StringComparison.OrdinalIgnoreCase)) ||
                        allergy.AllergenName.Contains(item.MedicineName, StringComparison.OrdinalIgnoreCase);

                    if (matchesName)
                    {
                        warnings.Add(new ClinicalWarningViewModel
                        {
                            Id = Guid.NewGuid(),
                            Type = ClinicalWarningType.Allergy,
                            Severity = allergy.Severity,
                            Message = $"Patient has a recorded allergy to '{allergy.AllergenName}' ({allergy.ReactionType ?? "reaction type not specified"}).",
                            RecommendedAction = "Verify with the patient before prescribing; consider an alternative medication."
                        });
                    }
                }

                // 2. Duplicate within the current submitted batch.
                bool duplicateInBatch = request.Items.Count(i => i.MedicineId == item.MedicineId) > 1;
                if (duplicateInBatch)
                {
                    warnings.Add(new ClinicalWarningViewModel
                    {
                        Id = Guid.NewGuid(),
                        Type = ClinicalWarningType.DuplicateMedication,
                        Severity = Domain.Enums.Severity.Moderate,
                        Message = $"'{item.MedicineName}' appears more than once in this prescription.",
                        RecommendedAction = "Remove the duplicate line or adjust quantities on a single line."
                    });
                }

                // 3. Duplicate against the patient's other currently-issued prescriptions.
                if (existingActiveMedicineIds.Contains(item.MedicineId))
                {
                    warnings.Add(new ClinicalWarningViewModel
                    {
                        Id = Guid.NewGuid(),
                        Type = ClinicalWarningType.DuplicateMedication,
                        Severity = Domain.Enums.Severity.Severe,
                        Message = $"'{item.MedicineName}' is already active on another issued prescription for this patient.",
                        RecommendedAction = "Confirm this is intentional (e.g. refill) before issuing."
                    });
                }
            }

            return result;
        }
    }
}
