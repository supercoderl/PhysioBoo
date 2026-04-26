namespace PhysioBoo.Application.ViewModels.ImagingModalities
{
    public sealed record UpdateImagingModalityViewModel
    (
        string Name,
        string? Code,
        string? Description,
        string? Category,
        bool RequiresContrast,
        bool PreparationRequired,
        string? PreparationInstructions,
        int AverageDurationMinutes,
        decimal RadiationDose,
        bool IsActive
    );
}
