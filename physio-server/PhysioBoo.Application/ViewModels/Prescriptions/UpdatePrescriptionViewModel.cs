using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record UpdatePrescriptionViewModel
    (
        Guid Id,
        string? Diagnosis,
        string? Instructions,
        List<UpdatePrescriptionItemInput> Items
    );

    public sealed record UpdatePrescriptionItemInput(
        Guid? Id,
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
        bool TimingMorning,
        bool TimingNoon,
        bool TimingAfternoon,
        bool TimingEvening,
        bool IsPrn,
        BeforeAfterMeal BeforeAfterMeal,
        string Unit,
        int RefillCount,
        bool IsInsuranceCovered,
        bool IsCatalogVerified
    );
}
