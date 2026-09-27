namespace PhysioBoo.Application.ViewModels.Leads
{
    public sealed record CreateLeadViewModel(
        string Name,
        string Phone,
        string Email,
        string Service,
        string Source,
        string Status,
        string Priority,
        string? AssignedTo,
        string? Notes
    );
}
