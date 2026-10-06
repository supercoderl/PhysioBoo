namespace PhysioBoo.Application.ViewModels.Nursing
{
    // The UI sends acknowledgedBy ("You"); the server records the signed-in user instead.
    public sealed record AcknowledgeHandoverViewModel(string? AcknowledgedBy);
}
