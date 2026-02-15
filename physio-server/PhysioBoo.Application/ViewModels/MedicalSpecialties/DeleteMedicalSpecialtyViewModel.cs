namespace PhysioBoo.Application.ViewModels.MedicalSpecialties
{
    public sealed record DeleteMedicalSpecialtyViewModel
    (
        Guid Id,
        bool IsHard
    );
}
