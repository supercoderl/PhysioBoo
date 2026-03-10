namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed record CreateLabTestCategoryViewModel
    (
        Guid Id,
        string Name,
        string? Description,
        string? Department
    );
}
