using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorAward : Entity
    {
        #region Core Doctor Award Table (12)
        public Guid DoctorId { get; private set; }
        public string AwardName { get; private set; }
        public string? AwardCategory { get; private set; }
        public string AwardingOrganization { get; private set; }
        public string? AwardLevel { get; private set; }
        public DateOnly? AwardDate { get; private set; }
        public int? AwardYear { get; private set; }
        public string? Description { get; private set; }
        public decimal? MonetaryValue { get; private set; }
        public string? CertificateUrl { get; private set; }
        public string? MediaCoverageUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Awards")]
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor (12)
        public DoctorAward(
            Guid id,
            Guid doctorId,
            string awardName,
            string? awardCategory,
            string awardingOrganization,
            string? awardLevel,
            DateOnly? awardDate,
            int? awardYear,
            string? description,
            decimal? monetaryValue,
            string? certificateUrl,
            string? mediaCoverageUrl
        ) : base(id)
        {
            DoctorId = doctorId;
            AwardName = awardName;
            AwardCategory = awardCategory;
            AwardingOrganization = awardingOrganization;
            AwardLevel = awardLevel;
            AwardDate = awardDate;
            AwardYear = awardYear;
            Description = description;
            MonetaryValue = monetaryValue;
            CertificateUrl = certificateUrl;
            MediaCoverageUrl = mediaCoverageUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (12)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetAwardName(string awardName) { AwardName = awardName; }
        public void SetAwardCategory(string? awardCategory) { AwardCategory = awardCategory; }
        public void SetAwardingOrganization(string awardingOrganization) { AwardingOrganization = awardingOrganization; }
        public void SetAwardLevel(string? awardLevel) { AwardLevel = awardLevel; }
        public void SetAwardDate(DateOnly? awardDate) { AwardDate = awardDate; }
        public void SetAwardYear(int? awardYear) { AwardYear = awardYear; }
        public void SetDescription(string? description) { Description = description; }
        public void SetMonetaryValue(decimal? monetaryValue) { MonetaryValue = monetaryValue; }
        public void SetCertificateUrl(string? certificateUrl) { CertificateUrl = certificateUrl; }
        public void SetMediaCoverageUrl(string? mediaCoverageUrl) { MediaCoverageUrl = mediaCoverageUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
