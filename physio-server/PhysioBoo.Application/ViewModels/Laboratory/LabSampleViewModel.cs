namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabSampleTimelineEventViewModel(
        string Stage,
        DateTime? OccurredAt
    );

    public sealed record LabSampleViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string TestName,
        string Barcode,
        string SampleType,
        string ContainerType,
        DateTime? CollectionTime,
        string? CollectorName,
        string CollectionStatus,
        List<LabSampleTimelineEventViewModel> Timeline
    );
}
