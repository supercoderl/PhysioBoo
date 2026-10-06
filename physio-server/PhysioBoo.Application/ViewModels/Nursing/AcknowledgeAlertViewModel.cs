namespace PhysioBoo.Application.ViewModels.Nursing
{
    // Shared by the nursing and treatment-sheet acknowledge endpoints. The UI posts an empty object.
    public sealed record AcknowledgeAlertViewModel(string? Note);
}
