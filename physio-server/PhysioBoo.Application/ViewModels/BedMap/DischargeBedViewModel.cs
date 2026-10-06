namespace PhysioBoo.Application.ViewModels.BedMap
{
    // The UI sends an empty object, so every field is optional.
    public sealed record DischargeBedViewModel(
        DateTime? DischargeDate,
        string? Notes
    );
}
