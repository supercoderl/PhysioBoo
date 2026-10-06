namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed record UpdateWardViewModel(
        string? Code,
        string Name,
        int Floor,
        Guid? DepartmentId
    );
}
