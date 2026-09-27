namespace PhysioBoo.Application.ViewModels.Leads
{
    public sealed record LeadFilter(
        DateTime? Start,
        DateTime? End,
        string? Status,
        string? Priority
    );
}
