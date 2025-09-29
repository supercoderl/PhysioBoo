namespace PhysioBoo.Application.ViewModels.DoctorSpecialties
{
    public sealed record CreateDoctorSpecialtyViewModel
    (
         Guid Id,
         Guid DoctorId,
         Guid SpecialtyId,
         string? CertificationNumber,
         DateOnly? CertificationDate,
         DateOnly? CertificationExpiry
    );
}
