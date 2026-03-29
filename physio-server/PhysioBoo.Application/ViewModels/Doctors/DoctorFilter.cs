namespace PhysioBoo.Application.ViewModels.Doctors
{
    /// <summary>
    /// Represents filter criteria when querying doctors.
    /// </summary>
    public sealed record DoctorFilter
    (
        string Start,
        string End
    );
}
