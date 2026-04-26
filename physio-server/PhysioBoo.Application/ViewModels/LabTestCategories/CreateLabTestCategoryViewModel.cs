namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed record CreateLabTestCategoryViewModel
    (
        string Name,
        string? Description,
        string? Department
    );
}
