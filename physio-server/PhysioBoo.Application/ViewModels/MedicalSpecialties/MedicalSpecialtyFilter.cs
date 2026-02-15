namespace PhysioBoo.Application.ViewModels.MedicalSpecialties
{
    /// <summary>
    /// Represents filter criteria when querying medical specialties.
    /// </summary>
    public sealed record MedicalSpecialtyFilter
    (
        string Start,
        string End,
        bool? IsSurgical
    );
}
