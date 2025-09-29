namespace PhysioBoo.Application.ViewModels.DoctorEducations
{
    public sealed record CreateDoctorEducationViewModel
    (
        Guid Id,
        Guid DoctorId,
        string DegreeType,
        string DegreeName,
        string? Specialization,
        string InstitutionName,
        string? UniversityName,
        string? Location,
        string? Country,
        DateOnly? StartDate,
        DateOnly? CompletionDate,
        decimal? DurationYears,
        decimal? GradePercentage,
        decimal? GradeGPA,
        string? GradeClass,
        string? ThesisTitle,
        string? ThesisGuide,
        string? VerificationDocumentUrl
    );
}
