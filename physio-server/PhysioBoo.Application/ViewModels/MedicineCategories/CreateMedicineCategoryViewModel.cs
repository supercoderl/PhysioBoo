namespace PhysioBoo.Application.ViewModels.MedicineCategories
{
    public sealed record CreateMedicineCategoryViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Description,
        Guid? ParentCategoryId,
        string? StorageConditions
    );
}
