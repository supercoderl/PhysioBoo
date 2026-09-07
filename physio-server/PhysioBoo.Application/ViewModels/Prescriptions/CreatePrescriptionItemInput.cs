using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record CreatePrescriptionItemInput
    (
        Guid MedicineId,
        string MedicineName,
        string? GenericName,
        string? Strength,
        string? DosageForm,
        int QuantityPrescribed,
        string DosageInstructions,
        string Frequency,
        int DurationInDays,
        string? RouteOfAdministration,
        string? SpecialInstructions,
        decimal PricePerUnit,
        string Unit,
        bool TimingMorning,
        bool TimingNoon,
        bool TimingAfternoon,
        bool TimingEvening,
        bool IsPrn,
        BeforeAfterMeal BeforeAfterMeal,
        int RefillCount,
        bool IsInsuranceCovered,
        bool IsCatalogVerified
    );
}
