namespace PhysioBoo.Application.ViewModels.LabTests
{
    public sealed record CreateLabTestViewModel
    (
        Guid Id,
        string TestName,
        Guid CategoryId,
        string? Description,
        string? SampleType,
        string? SampleVolume,
        string? CollectionInstructions,
        bool PreparationRequired,
        string? PreparationInstructions,
        bool FastingRequired,
        int FastingHours,
        string? NormalRangeMale,
        string? NormalRangeFemale,
        string? NormalPediatric,
        string? UnitOfMeasurement,
        string? Methodology,
        int ReportingTimeHours,
        decimal Cost,
        bool IsProfile,
        bool IsUrgentAvailable,
        decimal UrgentCost,
        int UrgentReportingTimeHours,
        bool IsHomeCollectionAvailable,
        decimal HomeCollectionCharge,
        bool RequiresAppoinment
    );
}
