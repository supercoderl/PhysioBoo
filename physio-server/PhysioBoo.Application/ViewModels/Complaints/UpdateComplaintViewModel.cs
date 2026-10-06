using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Complaints
{
    public sealed record UpdateComplaintViewModel(
        string PatientName,
        string? PatientId,
        string Email,
        string Phone,
        ComplaintCategory Category,
        ComplaintPriority Priority,
        ComplaintStatus Status,
        string Subject,
        string Description,
        string? AssignedTo
    );
}
