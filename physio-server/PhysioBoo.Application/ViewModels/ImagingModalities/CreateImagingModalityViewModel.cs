namespace PhysioBoo.Application.ViewModels.ImagingModalities
{
    public sealed record CreateImagingModalityViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Description,
        string? Category,
        string? PreparationInstructions,
        decimal RadiationDose
    );
}
