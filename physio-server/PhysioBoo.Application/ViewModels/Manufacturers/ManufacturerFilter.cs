namespace PhysioBoo.Application.ViewModels.Manufacturers
{
    /// <summary>
    /// Represents filter criteria when querying manufacturers.
    /// </summary>
    public sealed record ManufacturerFilter
    (
        string Start,
        string End
    );
}
