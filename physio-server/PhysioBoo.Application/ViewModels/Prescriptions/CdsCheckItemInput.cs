namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record CdsCheckItemInput
    (
        Guid ItemKey,
        Guid MedicineId,
        string MedicineName,
        string? GenericName,
        string DosageInstructions,
        string Frequency,
        int DurationInDays
    );
}
