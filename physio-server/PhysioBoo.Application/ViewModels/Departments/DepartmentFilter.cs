namespace PhysioBoo.Application.ViewModels.Departments
{
    /// <summary>
    /// Represents filter criteria when querying departments.
    /// </summary>
    public sealed record DepartmentFilter
    (
        string Start,
        string End
    );
}
