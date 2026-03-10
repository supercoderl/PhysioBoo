namespace PhysioBoo.Application.ViewModels.LabTests
{
    /// <summary>
    /// Represents filter criteria when querying lab tests.
    /// </summary>
    public sealed record LabTestFilter
    (
        string Start,
        string End
    );
}
