using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed class PrescriptionDraftViewModel
    {
        public Guid Id { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public Guid AppointmentId { get; set; }
        public Guid MedicalRecordId { get; set; }
        public PrescriptionStatus Status { get; set; }
        public DateOnly PrescriptionDate { get; set; }
        public string? Diagnosis { get; set; }
        public string? Instructions { get; set; }
        public decimal TotalAmount { get; set; }
        public DateOnly? ValidUntil { get; set; }
        public int RefillCount { get; set; }
        public int MaxRefills { get; set; }
        public bool IsDigital { get; set; }
        public bool IsPrinted { get; set; }
        public string? PharmacistNotes { get; set; }
        public string? ReasonCancel { get; set; }
        public DateTime? CancelledAt { get; set; }
        public DateTime? IssuedAt { get; set; }
        public List<PrescriptionItemDraftViewModel> Items { get; set; } = new();

        public static PrescriptionDraftViewModel FromPrescription(Prescription prescription)
        {
            return new PrescriptionDraftViewModel
            {
                Id = prescription.Id,
                PrescriptionNumber = prescription.PrescriptionNumber,
                PatientId = prescription.PatientId,
                PatientName = prescription.Patient?.Profile?.FullName ?? string.Empty,
                DoctorId = prescription.DoctorId,
                DoctorName = prescription.Doctor?.User?.Profile?.FullName ?? string.Empty,
                AppointmentId = prescription.AppoinmentId,
                MedicalRecordId = prescription.MedicalRecordId,
                Status = prescription.Status,
                PrescriptionDate = prescription.PrescriptionDate,
                Diagnosis = prescription.Diagnosis,
                Instructions = prescription.Instructions,
                TotalAmount = prescription.TotalAmount,
                ValidUntil = prescription.ValidUntil,
                RefillCount = prescription.RefillCount,
                MaxRefills = prescription.MaxRefills,
                IsDigital = prescription.IsDigital,
                IsPrinted = prescription.IsPrinted,
                PharmacistNotes = prescription.PharmacistNotes,
                ReasonCancel = prescription.ReasonCancel,
                CancelledAt = prescription.CancelledAt,
                IssuedAt = prescription.IssuedAt,
                Items = prescription.PrescriptionItems
                    .Select(PrescriptionItemDraftViewModel.FromPrescriptionItem)
                    .ToList()
            };
        }
    }

    public sealed class PrescriptionItemDraftViewModel
    {
        public Guid Id { get; set; }
        public Guid MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? Strength { get; set; }
        public string? DosageForm { get; set; }
        public int QuantityPrescribed { get; set; }
        public int QuantityDispensed { get; set; }
        public string DosageInstructions { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationInDays { get; set; }
        public string? RouteOfAdministration { get; set; }
        public string? SpecialInstructions { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal TotalPrice { get; set; }
        public bool SubtituteAllowed { get; set; }
        public bool IsControlledSubstance { get; set; }
        public bool TimingMorning { get; set; }
        public bool TimingNoon { get; set; }
        public bool TimingAfternoon { get; set; }
        public bool TimingEvening { get; set; }
        public bool IsPrn { get; set; }
        public BeforeAfterMeal BeforeAfterMeal { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int RefillCount { get; set; }
        public bool IsInsuranceCovered { get; set; }
        public bool IsCatalogVerified { get; set; }
        public List<ClinicalWarningViewModel> ClinicalWarnings { get; set; } = new();

        public static PrescriptionItemDraftViewModel FromPrescriptionItem(PrescriptionItem item)
        {
            return new PrescriptionItemDraftViewModel
            {
                Id = item.Id,
                MedicineId = item.MedicineId,
                MedicineName = item.MedicineName,
                GenericName = item.GenericName,
                Strength = item.Strength,
                DosageForm = item.DosageForm,
                QuantityPrescribed = item.QuantityPrescribed,
                QuantityDispensed = item.QuantityDispensed,
                DosageInstructions = item.DosageInstructions,
                Frequency = item.Frequency,
                DurationInDays = item.DurationInDays,
                RouteOfAdministration = item.RouteOfAdministration,
                SpecialInstructions = item.SpecialInstructions,
                PricePerUnit = item.PricePerUnit,
                TotalPrice = item.TotalPrice,
                SubtituteAllowed = item.SubtituteAllowed,
                IsControlledSubstance = item.IsControlledSubstance,
                TimingMorning = item.TimingMorning,
                TimingNoon = item.TimingNoon,
                TimingAfternoon = item.TimingAfternoon,
                TimingEvening = item.TimingEvening,
                IsPrn = item.IsPrn,
                BeforeAfterMeal = item.BeforeAfterMeal,
                Unit = item.Unit,
                RefillCount = item.RefillCount,
                IsInsuranceCovered = item.IsInsuranceCovered,
                IsCatalogVerified = item.IsCatalogVerified,
                ClinicalWarnings = item.PrescriptionClinicalWarnings
                    .Select(ClinicalWarningViewModel.FromWarning)
                    .ToList()
            };
        }
    }

    public sealed class ClinicalWarningViewModel
    {
        public Guid Id { get; set; }
        public ClinicalWarningType Type { get; set; }
        public Domain.Enums.Severity Severity { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? RecommendedAction { get; set; }
        public Guid? AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }

        public static ClinicalWarningViewModel FromWarning(PrescriptionClinicalWarning warning)
        {
            return new ClinicalWarningViewModel
            {
                Id = warning.Id,
                Type = warning.Type,
                Severity = warning.Severity,
                Message = warning.Message,
                RecommendedAction = warning.RecommendedAction,
                AcknowledgedBy = warning.AcknowledgedBy,
                AcknowledgedAt = warning.AcknowledgedAt
            };
        }
    }
}
