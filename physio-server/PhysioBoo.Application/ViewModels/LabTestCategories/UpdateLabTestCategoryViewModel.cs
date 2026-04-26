namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed record UpdateLabTestCategoryViewModel
    (
        string Name,
        string? Description,
        string? Department,
        bool IsActive
    );
}
