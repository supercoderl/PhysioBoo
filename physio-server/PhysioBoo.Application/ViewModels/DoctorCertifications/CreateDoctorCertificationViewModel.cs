namespace PhysioBoo.Application.ViewModels.DoctorCertifications
{
    public sealed record CreateDoctorCertificationViewModel
    (
        Guid DoctorId,
        string CertificationName,
        string? CertificationType,
        string IssuingOrganization,
        string? CertificationNumber,
        DateOnly? IssueDate,
        DateOnly? ExpiryDate,
        bool IsLifetime,
        string? VerificationUrl,
        string? CertificateDocumentUrl
    );
}
