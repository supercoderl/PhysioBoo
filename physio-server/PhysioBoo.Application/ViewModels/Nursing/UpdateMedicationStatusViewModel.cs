namespace PhysioBoo.Application.ViewModels.Nursing
{
    // Shared by nursing (status Given|Missed|Held, reason) and the treatment sheet (Given|Missed|Refused|Held, notes).
    // Either Reason or Notes may carry the explanation.
    public sealed record UpdateMedicationStatusViewModel(
        string Status,
        string? Reason,
        string? Notes
    );
}
