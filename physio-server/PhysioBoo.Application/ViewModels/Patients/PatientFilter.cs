namespace PhysioBoo.Application.ViewModels.Patients
{
    /// <summary>
    /// Represents filter criteria when querying patients.
    /// </summary>
    public sealed record PatientFilter
    (
        string Start,
        string End
    );
}
