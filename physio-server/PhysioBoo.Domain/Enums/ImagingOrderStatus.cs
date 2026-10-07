namespace PhysioBoo.Domain.Enums
{
    public enum ImagingOrderStatus
    {
        Ordered,
        Scheduled,
        InProgress,
        Completed,
        Cancelled,
        ReportPending,
        // Radiology workspace stages (stored as strings, so appending is safe)
        Arrived,
        ImagingCompleted,
        ImageUploaded
    }
}
