using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorCertification : Entity
    {
        #region Core Doctor Certification Table (12)
        public Guid DoctorId { get; private set; }
        public string CertificationName { get; private set; }
        public string? CertificationType { get; private set; }
        public string IssuingOrganization { get; private set; }
        public string? CertificationNumber { get; private set; }
        public DateOnly? IssueDate { get; private set; }
        public DateOnly? ExpiryDate { get; private set; }
        public bool IsLifetime { get; private set; }
        public CertificationStatus Status { get; private set; }
        public string? VerificationUrl { get; private set; }
        public string? CertificateDocumentUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Certifications")]
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor(12)
        public DoctorCertification(
            Guid id,
            Guid doctorId,
            string certificationName,
            string? certificationType,
            string issuingOrganization,
            string? certificationNumber,
            DateOnly? issueDate,
            DateOnly? expiryDate,
            bool isLifetime,
            string? verificationUrl,
            string? certificateDocumentUrl
        ) : base(id)
        {
            DoctorId = doctorId;
            CertificationName = certificationName;
            CertificationType = certificationType;
            IssuingOrganization = issuingOrganization;
            CertificationNumber = certificationNumber;
            IssueDate = issueDate;
            ExpiryDate = expiryDate;
            IsLifetime = isLifetime;
            Status = CertificationStatus.Active;
            VerificationUrl = verificationUrl;
            CertificateDocumentUrl = certificateDocumentUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (12)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetCertificationName(string certificationName) { CertificationName = certificationName; }
        public void SetCertificationType(string? certificationType) { CertificationType = certificationType; }
        public void SetIssuingOrganization(string issuingOrganization) { IssuingOrganization = issuingOrganization; }
        public void SetCertificationNumber(string? certificationNumber) { CertificationNumber = certificationNumber; }
        public void SetIssueDate(DateOnly? issueDate) { IssueDate = issueDate; }
        public void SetExpiryDate(DateOnly? expiryDate) { ExpiryDate = expiryDate; }
        public void SetIsLifetime(bool isLifetime) { IsLifetime = isLifetime; }
        public void SetStatus(CertificationStatus status) { Status = status; }
        public void SetVerificationUrl(string? verificationUrl) { VerificationUrl = verificationUrl; }
        public void SetCertificateDocumentUrl(string? certificateDocumentUrl) { CertificateDocumentUrl = certificateDocumentUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
