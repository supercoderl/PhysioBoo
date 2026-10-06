using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Dispensing
{
    public static class DispensingMapper
    {
        public const string PrescriptionIncludes =
            "Patient.Profile,Patient.Allergies,Patient.MedicalHistories,Doctor.User.Profile,Doctor.Department,Hospital,PrescriptionItems.PrescriptionClinicalWarnings";

        /// <summary>
        /// Prescriptions the pharmacy still has work to do on.
        /// </summary>
        public static readonly PrescriptionStatus[] DispensableStatuses = { PrescriptionStatus.Issued, PrescriptionStatus.PartiallyDispensed };

        public static string SeverityLabel(Domain.Enums.Severity severity) => severity switch
        {
            Domain.Enums.Severity.Critical => "Critical",
            Domain.Enums.Severity.Severe => "High",
            Domain.Enums.Severity.Moderate => "Medium",
            Domain.Enums.Severity.Mild => "Low",
            _ => "Info"
        };

        public static string WarningTypeLabel(ClinicalWarningType type) => type switch
        {
            ClinicalWarningType.Allergy => "AllergyWarning",
            ClinicalWarningType.Pregnancy => "PregnancyWarning",
            ClinicalWarningType.Pediatric => "PediatricWarning",
            _ => type.ToString()
        };

        public static bool HasUnacknowledgedCritical(Prescription prescription) =>
            prescription.PrescriptionItems.Any(i => i.PrescriptionClinicalWarnings.Any(w => w.Severity == Domain.Enums.Severity.Critical && w.AcknowledgedAt == null));

        public static string Priority(Prescription prescription)
        {
            List<PrescriptionClinicalWarning> open = prescription.PrescriptionItems
                .SelectMany(i => i.PrescriptionClinicalWarnings)
                .Where(w => w.AcknowledgedAt == null)
                .ToList();

            if (open.Any(w => w.Severity == Domain.Enums.Severity.Critical)) return "Critical";

            bool highRiskPatient = prescription.Patient?.RiskLevel is RiskLevel.High or RiskLevel.Critical;
            bool controlled = prescription.PrescriptionItems.Any(i => i.IsControlledSubstance);

            return open.Any(w => w.Severity == Domain.Enums.Severity.Severe) || highRiskPatient || controlled ? "High" : "Normal";
        }

        /// <summary>
        /// A completed session on a prescription that still has quantity outstanding is waiting for its next round.
        /// </summary>
        public static DispenseStatus EffectiveStatus(Prescription prescription, DispenseSession? session)
        {
            if (session == null) return DispenseStatus.Waiting;
            if (session.Status == DispenseStatus.Completed && DispensableStatuses.Contains(prescription.Status)) return DispenseStatus.Waiting;
            return session.Status;
        }

        public static string WardOrClinic(Prescription prescription) =>
            prescription.Doctor?.Department?.Name ?? prescription.Hospital?.Name ?? string.Empty;

        public static DispenseQueueItemViewModel ToQueueItem(Prescription prescription, DispenseSession? session, int queueNumber) => new()
        {
            QueueId = prescription.Id,
            QueueNumber = queueNumber,
            PrescriptionNumber = prescription.PrescriptionNumber,
            PatientId = prescription.PatientId,
            PatientName = prescription.Patient?.Profile?.FullName ?? string.Empty,
            Mrn = prescription.Patient?.PatientNumber ?? string.Empty,
            WardOrClinic = WardOrClinic(prescription),
            Priority = Priority(prescription),
            PrescribingDoctor = prescription.Doctor?.User?.Profile?.FullName ?? string.Empty,
            MedicationCount = prescription.PrescriptionItems.Count,
            CreatedAt = prescription.IssuedAt ?? prescription.CreatedAt,
            Status = EffectiveStatus(prescription, session).ToString()
        };

        public static DispenseWorkspaceViewModel ToWorkspace(Prescription prescription, DispenseSession? session, DispensingStock stock)
        {
            List<DispenseMedicationItemViewModel> items = prescription.PrescriptionItems
                .OrderBy(i => i.CreatedAt)
                .Select(i => ToItem(i, session?.Items.FirstOrDefault(s => s.PrescriptionItemId == i.Id), stock))
                .ToList();

            return new DispenseWorkspaceViewModel
            {
                WorkspaceId = prescription.Id,
                QueueId = prescription.Id,
                PrescriptionNumber = prescription.PrescriptionNumber,
                Status = EffectiveStatus(prescription, session).ToString(),
                CurrentStage = Stage(prescription, session, items),
                PrescribingDoctor = prescription.Doctor?.User?.Profile?.FullName ?? string.Empty,
                CreatedAt = prescription.IssuedAt ?? prescription.CreatedAt,
                DispensingStartedAt = session?.StartedAt,
                Patient = ToPatient(prescription),
                Items = items,
                PharmacistNotes = session?.PharmacistNotes ?? prescription.PharmacistNotes ?? string.Empty
            };
        }

        public static DispenseMedicationItemViewModel ToItem(PrescriptionItem item, DispenseSessionItem? sessionItem, DispensingStock stock)
        {
            Guid medicineId = sessionItem?.MedicineId ?? item.MedicineId;
            stock.Medicines.TryGetValue(medicineId, out Medicine? medicine);
            int remaining = Math.Max(0, item.QuantityPrescribed - item.QuantityDispensed);

            MedicineInventory? batch = sessionItem?.MedicineInventoryId is Guid batchId
                ? stock.BatchesOf(medicineId).FirstOrDefault(b => b.Id == batchId)
                : stock.PickFefo(medicineId, remaining);

            bool replaced = sessionItem?.ReplacedFromMedicineId != null;
            bool controlled = item.IsControlledSubstance || (medicine?.IsControlledSubstance ?? false);

            return new DispenseMedicationItemViewModel
            {
                Id = item.Id,
                MedicineId = medicineId,
                Name = replaced ? medicine?.Name ?? item.MedicineName : item.MedicineName,
                GenericName = replaced ? medicine?.GenericName : item.GenericName,
                Strength = replaced ? medicine?.Strength : item.Strength,
                DosageForm = replaced ? medicine?.DosageForm.ToString() : item.DosageForm,
                Route = item.RouteOfAdministration,
                Dose = item.DosageInstructions,
                Frequency = item.Frequency,
                DurationDays = item.DurationInDays,
                QtyPrescribed = item.QuantityPrescribed,
                QtyToDispense = sessionItem?.QuantityToDispense ?? remaining,
                Unit = item.Unit,
                Status = (sessionItem?.Status ?? (remaining == 0 ? DispenseItemStatus.Dispensed : DispenseItemStatus.NotPicked)).ToString(),
                ShelfLocation = batch != null ? DispensingStock.Location(batch) : string.Empty,
                BatchNo = batch?.BatchNumber ?? string.Empty,
                ExpiryDate = batch?.ExpiryDate,
                AvailableBatches = stock.BatchesOf(medicineId).Where(DispensingStock.IsUsable).Select(DispensingStock.ToBatchOption).ToList(),
                IsControlledSubstance = controlled,
                IsHighAlert = controlled || (medicine?.WarningLabels?.Any(l => l.Contains("high", StringComparison.OrdinalIgnoreCase)) ?? false),
                Warnings = item.PrescriptionClinicalWarnings
                    .OrderByDescending(w => w.Severity)
                    .Select(w => new DispenseClinicalWarningViewModel
                    {
                        Id = w.Id,
                        ItemId = item.Id,
                        Type = WarningTypeLabel(w.Type),
                        Severity = SeverityLabel(w.Severity),
                        Message = w.Message,
                        Recommendation = w.RecommendedAction,
                        Acknowledged = w.AcknowledgedAt != null
                    })
                    .ToList(),
                // Only offer substitutes when the prescriber allowed substitution.
                Alternatives = item.SubtituteAllowed && stock.Alternatives.TryGetValue(item.MedicineId, out List<DispenseMedicineAlternativeViewModel>? alts)
                    ? alts
                    : new List<DispenseMedicineAlternativeViewModel>()
            };
        }

        private static string Stage(Prescription prescription, DispenseSession? session, List<DispenseMedicationItemViewModel> items)
        {
            if (session == null) return "Received";
            if (EffectiveStatus(prescription, session) == DispenseStatus.Completed) return "Completed";
            if (HasUnacknowledgedCritical(prescription)) return "ClinicalVerification";
            if (items.Any(i => i.Status == nameof(DispenseItemStatus.NotPicked))) return "InventoryPicking";
            if (items.Any(i => i.Status == nameof(DispenseItemStatus.Picked))) return "BarcodeValidation";
            return "Ready";
        }

        private static DispensePatientSummaryViewModel ToPatient(Prescription prescription)
        {
            Patient? patient = prescription.Patient;
            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            DateOnly? dob = patient?.Profile?.DateOfBirth;
            int age = 0;
            if (dob.HasValue)
            {
                age = today.Year - dob.Value.Year;
                if (dob.Value > today.AddYears(-age)) age--;
            }

            bool insured = !string.IsNullOrWhiteSpace(patient?.InssuranceProvider)
                && (patient!.InssuranceExpiryDate == null || patient.InssuranceExpiryDate >= today);

            return new DispensePatientSummaryViewModel
            {
                PatientId = prescription.PatientId,
                FullName = patient?.Profile?.FullName ?? string.Empty,
                Mrn = patient?.PatientNumber ?? string.Empty,
                Gender = patient?.Profile?.Gender.ToString() ?? string.Empty,
                AgeYears = age,
                Allergies = patient?.Allergies.Where(a => a.IsActive).Select(a => a.AllergenName).ToList() ?? new List<string>(),
                AllergyFreeText = patient?.AllergyInformation,
                ChronicConditions = patient?.MedicalHistories
                    .Where(h => h.CurrentStatus is CurrentStatus.Active or CurrentStatus.Managed)
                    .Select(h => h.ConditionName)
                    .ToList() ?? new List<string>(),
                PrimaryDiagnosis = prescription.Diagnosis,
                InsuranceProvider = patient?.InssuranceProvider,
                InsuranceCovered = insured,
                // Pregnancy status is not recorded on the patient record yet.
                IsPregnant = false,
                IsPediatric = dob.HasValue && age < 18,
                IsElderly = (dob.HasValue && age >= 65) || (patient?.IsSeniorCitizen ?? false),
                IsHighRisk = patient?.RiskLevel is RiskLevel.High or RiskLevel.Critical
            };
        }
    }
}
