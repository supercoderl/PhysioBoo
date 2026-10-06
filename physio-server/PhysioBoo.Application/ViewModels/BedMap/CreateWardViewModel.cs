namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed record CreateWardViewModel(
        string? Code,
        string Name,
        int Floor,
        Guid? DepartmentId
    );
}
