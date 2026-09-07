using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PatientAllergies
{
    public sealed record CreatePatientAllergyViewModel
    (
        Guid Id,
        Guid PatientId,
        string AllergenName,
        AllergenType AllergenType,
        string? ReactionType,
        Domain.Enums.Severity Severity,
        DateOnly? FirstOccurenceDate,
        DateOnly? LastOccurenceDate,
        string? TreatmentGiven,
        string? Notes
    );
}
