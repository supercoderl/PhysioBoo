namespace PhysioBoo.Application.ViewModels.Hospitals
{
    /// <summary>
    /// Represents filter criteria when querying hospitals.
    /// </summary>
    public sealed record HospitalFilter
    (
        string Start,
        string End,
        Guid? HospitalGroupId,
        int? Type,
        bool? IsActive,
        bool? HasEmergencyServices
    );
}
