namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    /// <summary>
    /// Represents filter criteria when querying lab test categories.
    /// </summary>
    public sealed record LabTestCategoryFilter
    (
        string Start,
        string End
    );
}
