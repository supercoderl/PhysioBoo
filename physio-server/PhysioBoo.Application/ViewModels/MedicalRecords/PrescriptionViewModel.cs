using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class PrescriptionViewModel
    {
        public sealed class PrescriptionItemRow
        {
            public Guid Id { get; set; }
            public string MedicineName { get; set; } = string.Empty;
            public string? GenericName { get; set; }
            public string? Strength { get; set; }
            public string? DosageForm { get; set; }
            public string DosageInstructions { get; set; } = string.Empty;
            public string Frequency { get; set; } = string.Empty;
            public int DurationDays { get; set; }
            public string? RouteOfAdministration { get; set; }
            public int QuantityPrescribed { get; set; }
            public int QuantityDispensed { get; set; }
            public bool IsControlledSubstance { get; set; }
            public string? SpecialInstructions { get; set; }

            public static PrescriptionItemRow FromPrescriptionItem(PrescriptionItem prescriptionItem)
            {
                return new PrescriptionItemRow
                {
                    Id = prescriptionItem.Id,
                    MedicineName = prescriptionItem.MedicineName,
                    GenericName = prescriptionItem.GenericName,
                    Strength = prescriptionItem.Strength,
                    DosageForm = prescriptionItem.DosageForm,
                    DosageInstructions = prescriptionItem.DosageInstructions,
                    Frequency = prescriptionItem.Frequency,
                    DurationDays = prescriptionItem.DurationInDays,
                    RouteOfAdministration = prescriptionItem.RouteOfAdministration,
                    QuantityPrescribed = prescriptionItem.QuantityPrescribed,
                    QuantityDispensed = prescriptionItem.QuantityDispensed,
                    IsControlledSubstance = prescriptionItem.IsControlledSubstance,
                    SpecialInstructions = prescriptionItem.SpecialInstructions
                };
            }
        }

        public Guid Id { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public string PrescriptionDate { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? Instruction { get; set; }
        public PrescriptionStatus Status { get; set; }
        public string? ValidUntil { get; set; }
        public int RefillCount { get; set; }
        public int MaxRefills { get; set; }
        public decimal TotalAmount { get; set; }
        public IReadOnlyList<PrescriptionItemRow> PrescriptionItemRows { get; set; } = Array.Empty<PrescriptionItemRow>();

        public static PrescriptionViewModel FromPrescription(Prescription prescription)
        {
            return new PrescriptionViewModel
            {
                Id = prescription.Id,
                PrescriptionNumber = prescription.PrescriptionNumber,
                PrescriptionDate = TimeZoneHelper.ConvertDateTimeToString(prescription.PrescriptionDate, DateFormats.IsoDate),
                DoctorName = prescription.Doctor?.User?.Profile?.FullName ?? string.Empty,
                Diagnosis = prescription.Diagnosis,
                Instruction = prescription.Instructions,
                Status = prescription.Status,
                ValidUntil = TimeZoneHelper.ConvertDateTimeToString(prescription.ValidUntil, DateFormats.IsoDate),
                RefillCount = prescription.RefillCount,
                MaxRefills = prescription.MaxRefills,
                TotalAmount = prescription.TotalAmount,
                PrescriptionItemRows = prescription.PrescriptionItems.Any() ? prescription.PrescriptionItems.Select(x => PrescriptionItemRow.FromPrescriptionItem(x)).ToList() : Array.Empty<PrescriptionItemRow>()
            };
        }
    }
}
