using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PrescriptionTemplates
{
    public sealed class RecentPrescriptionViewModel
    {
        public Guid Id { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public DateOnly Date { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<string> MedicationNames { get; set; } = new();
    }

    public sealed class FavoriteMedicationViewModel
    {
        public Guid Id { get; set; }
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
        public string Dose { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;

        /// <summary>
        /// Expects Medicine to be loaded.
        /// </summary>
        public static FavoriteMedicationViewModel FromEntity(FavoriteMedication favorite)
        {
            string frequency = favorite.DefaultFrequency ?? "OD";
            int duration = favorite.DefaultDurationInDays ?? 5;

            return new FavoriteMedicationViewModel
            {
                Id = favorite.Id,
                MedicineId = favorite.MedicineId,
                Name = favorite.Medicine?.Name ?? string.Empty,
                Strength = favorite.Medicine?.Strength ?? string.Empty,
                Dose = favorite.DefaultDose ?? "1",
                Frequency = frequency,
                DurationDays = duration,
                Quantity = PrescriptionDosing.EstimateQuantity(frequency, duration),
                Unit = favorite.Medicine?.DosageForm.ToString() ?? string.Empty
            };
        }
    }

    public sealed class PrescriptionTemplateViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public List<TemplateMedicationItemViewModel> Items { get; set; } = new();
    }

    /// <summary>
    /// Same shape as the prescribing screen's medication line (minus id and warnings),
    /// so a template can be dropped straight into a draft.
    /// </summary>
    public sealed class TemplateMedicationItemViewModel
    {
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? BrandName { get; set; }
        public string? Strength { get; set; }
        public string? DosageForm { get; set; }
        public string? Route { get; set; }
        public string Dose { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public Dictionary<string, bool> Timing { get; set; } = new();
        public bool BeforeMeal { get; set; }
        public bool AfterMeal { get; set; }
        public bool Prn { get; set; }
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int RefillCount { get; set; }
        public string? Instructions { get; set; }
        public string? PharmacyNotes { get; set; }
        public bool InsuranceCovered { get; set; } = true;
        public string StockStatus { get; set; } = "InStock";
        public bool IsControlledSubstance { get; set; }
        public bool IsAntibiotic { get; set; }
        public bool IsHighAlert { get; set; }
        public bool IsOtc { get; set; }
        public bool IsPrescriptionOnly { get; set; }
        public bool IsCustomMedication { get; set; }
        public string Status { get; set; } = "Active";
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Expects Medicine to be loaded. <paramref name="freeStock"/> is the unreserved stock across batches.
        /// </summary>
        public static TemplateMedicationItemViewModel FromEntity(PrescriptionTemplateItem item, int freeStock)
        {
            Medicine? medicine = item.Medicine;
            string classes = $"{medicine?.TherapeuticClass} {medicine?.PharmacologicalClass}";
            bool controlled = medicine?.IsControlledSubstance ?? false;

            return new TemplateMedicationItemViewModel
            {
                MedicineId = item.MedicineId,
                Name = medicine?.Name ?? string.Empty,
                GenericName = medicine?.GenericName,
                BrandName = medicine?.BrandName,
                Strength = medicine?.Strength,
                DosageForm = medicine?.DosageForm.ToString(),
                Route = item.DefaultRouteOfAdministration ?? medicine?.RouteOfAdministration,
                Dose = item.DefaultDosageInstructions,
                Frequency = item.DefaultFrequency,
                Timing = new Dictionary<string, bool>
                {
                    ["morning"] = item.TimingMorning,
                    ["noon"] = item.TimingNoon,
                    ["afternoon"] = item.TimingAfternoon,
                    ["evening"] = item.TimingEvening
                },
                BeforeMeal = item.BeforeAfterMeal == BeforeAfterMeal.Before,
                AfterMeal = item.BeforeAfterMeal == BeforeAfterMeal.After,
                Prn = item.IsPrn,
                DurationDays = item.DefaultDurationInDays,
                Quantity = item.DefaultQuantity,
                Unit = item.Unit,
                StockStatus = freeStock <= 0 ? "OutOfStock" : freeStock < item.DefaultQuantity ? "Low" : "InStock",
                IsControlledSubstance = controlled,
                IsAntibiotic = classes.Contains("antibiotic", StringComparison.OrdinalIgnoreCase)
                    || classes.Contains("antibacterial", StringComparison.OrdinalIgnoreCase),
                IsHighAlert = controlled || (medicine?.WarningLabels?.Any(l => l.Contains("high", StringComparison.OrdinalIgnoreCase)) ?? false),
                IsOtc = medicine != null && !medicine.IsPrescriptionRequired,
                IsPrescriptionOnly = medicine?.IsPrescriptionRequired ?? true,
                UnitPrice = medicine?.SellingPrice ?? medicine?.Mrp ?? 0
            };
        }
    }

    public static class PrescriptionDosing
    {
        /// <summary>
        /// Rough doses-per-day from common frequency notations (OD, BD, TDS, QID, "3 times", PRN...).
        /// </summary>
        public static int DosesPerDay(string? frequency)
        {
            string f = (frequency ?? string.Empty).Trim().ToUpperInvariant();
            if (f.Length == 0) return 1;
            if (f.Contains("QID") || f.Contains("QDS") || f.Contains("4")) return 4;
            if (f.Contains("TDS") || f.Contains("TID") || f.Contains("THRICE") || f.Contains("3")) return 3;
            if (f.Contains("BD") || f.Contains("BID") || f.Contains("TWICE") || f.Contains("2")) return 2;
            return 1;
        }

        public static int EstimateQuantity(string? frequency, int durationDays) =>
            Math.Max(1, DosesPerDay(frequency) * Math.Max(1, durationDays));
    }

    public sealed record AddFavoriteMedicationViewModel(Guid MedicineId, string? Dose, string? Frequency, int? DurationDays);

    public sealed record CreatePrescriptionTemplateViewModel(
        Guid DoctorId,
        string Name,
        string? Description,
        List<TemplateItemInputViewModel> Items
    );

    public sealed record TemplateItemInputViewModel(
        Guid MedicineId,
        string Dose,
        string Frequency,
        int DurationDays,
        int Quantity,
        string? Unit,
        string? Route,
        Dictionary<string, bool>? Timing,
        bool BeforeMeal,
        bool AfterMeal,
        bool Prn
    );
}
