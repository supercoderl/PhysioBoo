namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    /// <summary>
    /// Represents filter criteria when querying hospital groups.
    /// </summary>
    public sealed record HospitalGroupFilter
    (
        string Start,
        string End
    );
}
