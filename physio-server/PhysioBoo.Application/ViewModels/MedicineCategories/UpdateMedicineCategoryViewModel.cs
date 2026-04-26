namespace PhysioBoo.Application.ViewModels.MedicineCategories
{
    public sealed record UpdateMedicineCategoryViewModel
    (
        string Name,
        string? Description,
        Guid? ParentCategoryId,
        bool IsControlled,
        bool RequiresPrescription,
        string? StorageConditions
    );
}
