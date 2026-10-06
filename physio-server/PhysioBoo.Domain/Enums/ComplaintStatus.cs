namespace PhysioBoo.Domain.Enums
{
    // Order matches the frontend enum (shared/enums/complaint.ts): the UI sends and reads numbers.
    public enum ComplaintStatus
    {
        Pending,
        InProgress,
        Resolved,
        Closed
    }
}
