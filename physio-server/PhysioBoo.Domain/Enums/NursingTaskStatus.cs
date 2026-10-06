namespace PhysioBoo.Domain.Enums
{
    // "Overdue" is not stored: it is a Pending task whose due time has passed.
    public enum NursingTaskStatus
    {
        Pending,
        Completed,
        Cancelled
    }
}
