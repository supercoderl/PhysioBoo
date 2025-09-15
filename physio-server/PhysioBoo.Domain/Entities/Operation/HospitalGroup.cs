using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class HospitalGroup : Entity
    {
        #region Core Hospital Group Table (13)
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public string? HeadquartersAddress { get; private set; }
        public string? Website { get; private set; }
        public string? Phone { get; private set; }
        public string? Email { get; private set; }
        public string? LogoUrl { get; private set; }
        public DateTime? EstablishedDate { get; private set; }
        public string? LicenseNumber { get; private set; }
        public string? AccreditationDetails { get; private set; } // JSONB
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [InverseProperty("HospitalGroup")]
        public virtual ICollection<Hospital> Hospitals { get; private set; } = new List<Hospital>();
        #endregion

        #region Constructor (13)
        public HospitalGroup(
            Guid id,
            string name,
            string? description,
            string? headquartersAddress,
            string? website,
            string? phone,
            string? email,
            string? logoUrl,
            DateTime? establishedDate,
            string? licenseNumber,
            string? accreditationDetails
        ) : base(id)
        {
            Name = name;
            Description = description;
            HeadquartersAddress = headquartersAddress;
            Website = website;
            Phone = phone;
            Email = email;
            LogoUrl = logoUrl;
            EstablishedDate = establishedDate;
            LicenseNumber = licenseNumber;
            AccreditationDetails = accreditationDetails;
            IsActive = true; // Default to active
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (13)
        public void SetName(string name) { Name = name; }
        public void SetDescription(string? description) { Description = description; }
        public void SetHeadquartersAddress(string? headquartersAddress) { HeadquartersAddress = headquartersAddress; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetLogoUrl(string? logoUrl) { LogoUrl = logoUrl; }
        public void SetEstablishedDate(DateTime? establishedDate) { EstablishedDate = establishedDate; }
        public void SetLicenseNumber(string? licenseNumber) { LicenseNumber = licenseNumber; }
        public void SetAccreditationDetails(string? accreditationDetails) { AccreditationDetails = accreditationDetails; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
