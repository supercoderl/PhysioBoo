namespace PhysioBoo.Application.ViewModels.MedicalSpecialties
{
    public sealed record UpdateMedicalSpecialtyViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Category,
        bool IsSurgical,
        bool IsDiagnostic,
        int AverageConsultationDuration,
        string? Description,
        string? RequiredQualifications,
        Guid? ParentSpecialtyId,
        string? IconUrl,
        string? IconPublicId
    );
}
