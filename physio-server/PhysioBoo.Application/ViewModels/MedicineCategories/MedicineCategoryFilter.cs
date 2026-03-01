namespace PhysioBoo.Application.ViewModels.MedicineCategories
{
    /// <summary>
    /// Represents filter criteria when querying medicine categories.
    /// </summary>
    public sealed record MedicineCategoryFilter
    (
        string Start,
        string End
    );
}
