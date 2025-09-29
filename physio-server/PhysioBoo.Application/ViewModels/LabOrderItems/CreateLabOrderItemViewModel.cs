namespace PhysioBoo.Application.ViewModels.LabOrderItems
{
    public sealed record CreateLabOrderItemViewModel
    (
        Guid Id,
        Guid LabOrderId,
        Guid LabTestId,
        string TestName,
        bool IsUrgent,
        DateTime? SampleCollectionTime,
        Guid? SampleCollectorId,
        decimal TestCost,
        string? ResultValue,
        string? ResultUnit,
        string? ReferenceRange,
        string? AbnormalFlag,
        Guid? TechnicianId,
        string? Notes
    );
}
