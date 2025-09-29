namespace PhysioBoo.Application.ViewModels.MedicalSpecialties
{
    public sealed record CreateMedicalSpecialtyViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Category,
        string? Description,
        string? RequiredQualifications,
        Guid? ParentSpecialtyId,
        string? IconUrl
    );
}
