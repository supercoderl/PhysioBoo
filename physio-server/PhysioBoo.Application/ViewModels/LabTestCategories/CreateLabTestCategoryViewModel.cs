namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed record CreateLabTestCategoryViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Description,
        string? Department
    );
}
