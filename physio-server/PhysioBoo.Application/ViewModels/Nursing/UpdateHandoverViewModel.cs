namespace PhysioBoo.Application.ViewModels.Nursing
{
    /// <summary>SBAR text edits by the outgoing nurse. Null fields are left unchanged.</summary>
    public sealed record UpdateHandoverViewModel(
        string? Situation,
        string? Background,
        string? Assessment,
        string? Recommendation
    );
}
