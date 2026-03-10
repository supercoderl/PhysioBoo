namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed record UpdateLabTestCategoryViewModel
    (
        Guid Id,
        string Name,
        string? Description,
        string? Department,
        bool IsActive
    );
}
