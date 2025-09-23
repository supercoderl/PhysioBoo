namespace PhysioBoo.Application.ViewModels.Doctors
{
    public sealed record CreateDoctorViewModel
    (
        string? EmployeeId,
        string MedicalLicenseNumber,
        DateOnly MedicalLicenseExpiry,
        string? MedicalLicenseIssuingAuthority,
        Guid? PrimarySpecialtyId,
        string? Bio,
        string? About,
        string? Archivements,
        string? ResearchInterests,
        string? CancellationPolicy,
        string? BankAccountDetails,
        string? PanNumber,
        string? Gstin,
        DateTime? TerminationDate,
        TimeOnly? VerificationDate,
        Guid? VerifiedBy
    );
}
