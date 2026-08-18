namespace PhysioBoo.Application.ViewModels.Appointments
{
    /// <summary>
    /// Represents filter criteria when querying appointments.
    /// </summary>
    public sealed record AppointmentFilter
    (
        string Start,
        string End
    );
}
