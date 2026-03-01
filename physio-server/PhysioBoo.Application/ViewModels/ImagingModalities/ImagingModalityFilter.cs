namespace PhysioBoo.Application.ViewModels.ImagingModalities
{
    /// <summary>
    /// Represents filter criteria when querying imaging modalities.
    /// </summary>
    public sealed record ImagingModalityFilter
    (
       string Start,
       string End,
       bool? RequiresContrast,
       bool? PreparationRequired,
       bool? IsActive
    );
}
