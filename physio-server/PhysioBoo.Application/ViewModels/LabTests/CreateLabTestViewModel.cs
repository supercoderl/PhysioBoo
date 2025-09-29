namespace PhysioBoo.Application.ViewModels.LabTests
{
    public sealed record CreateLabTestViewModel
    (
        Guid Id,
        string TestName,
        string? TestCode,
        Guid CategoryId,
        string? Description,
        string? SampleType,
        string? SampleVolume,
        string? CollectionInstructions,
        string? PreparationInstructions,
        string? NormalRangeMale,
        string? NormalRangeFemale,
        string? NormalPediatric,
        string? UnitOfMeasurement,
        string? Methodology
    );
}
