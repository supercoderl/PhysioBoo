using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Complaints
{
    // PatientId is a string because the drawer's "Patient ID" box is free text: an empty or
    // malformed value must produce a validation error, not a JSON binding failure.
    public sealed record CreateComplaintViewModel(
        string PatientName,
        string? PatientId,
        string Email,
        string Phone,
        ComplaintCategory Category,
        ComplaintPriority Priority,
        string Subject,
        string Description,
        string? AssignedTo
    );
}
