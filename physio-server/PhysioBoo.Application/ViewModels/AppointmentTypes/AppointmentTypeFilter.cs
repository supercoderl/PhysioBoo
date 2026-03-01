namespace PhysioBoo.Application.ViewModels.AppointmentTypes
{
    /// <summary>
    /// Represents filter criteria when querying appointment types.
    /// </summary>
    public sealed record AppointmentTypeFilter
    (
        string Start,
        string End,
        bool? IsEmergency,
        bool? RequiresPreparation,
        bool? IsFollowUp,
        bool? IsActive
    );
}
