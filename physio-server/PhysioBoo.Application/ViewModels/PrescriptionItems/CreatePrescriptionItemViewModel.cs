namespace PhysioBoo.Application.ViewModels.PrescriptionItems
{
    public sealed record CreatePrescriptionItemViewModel
    (
        Guid Id,
        Guid PrescriptionId,
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
        decimal PricePerUnit
    );
}
