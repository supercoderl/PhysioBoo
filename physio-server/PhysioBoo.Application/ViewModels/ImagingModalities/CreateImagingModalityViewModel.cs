namespace PhysioBoo.Application.ViewModels.ImagingModalities
{
    public sealed record CreateImagingModalityViewModel
    (
        string Name,
        string? Code,
        string? Description,
        string? Category,
        bool RequiresContrast,
        bool PreparationRequired,
        string? PreparationInstructions,
        int AverageDurationMinutes,
        decimal RadiationDose
    );
}
