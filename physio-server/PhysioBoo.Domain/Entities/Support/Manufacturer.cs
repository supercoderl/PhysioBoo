using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Support
{
    public class Manufacturer : Entity
    {
        #region Core Manufacturer Table (17)
        public string Name { get; private set; }
        public string? CompanyCode { get; private set; }
        public string? Address { get; private set; }
        public string? City { get; private set; }
        public string? State { get; private set; }
        public string? Country { get; private set; }
        public string? PostalCode { get; private set; }
        public string? Phone { get; private set; }
        public string? Email { get; private set; }
        public string? Website { get; private set; }
        public string? LicenseNumber { get; private set; }
        public bool GmpCertified { get; private set; }
        public bool IsoCertified { get; private set; }
        public bool FdaApproved { get; private set; }
        public int EstablishedYear { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("Manufacturer")]
        public virtual ICollection<Medicine> Medicines { get; private set; } = new List<Medicine>();
        #endregion

        #region Constructor (17)
        public Manufacturer(
            Guid id,
            string name,
            string? companyCode,
            string? address,
            string? city,
            string? state,
            string? country,
            string? postalCode,
            string? phone,
            string? email,
            string? website,
            string? licenseNumber,
            int establishedYear
        ) : base(id)
        {
            Name = name;
            CompanyCode = companyCode;
            Address = address;
            City = city;
            State = state;
            Country = country;
            PostalCode = postalCode;
            Phone = phone;
            Email = email;
            Website = website;
            LicenseNumber = licenseNumber;
            GmpCertified = false;
            IsoCertified = false;
            FdaApproved = false;
            EstablishedYear = establishedYear;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (17)
        public void SetName(string name) { Name = name; }
        public void SetCompanyCode(string? companyCode) { CompanyCode = companyCode; }
        public void SetAddress(string? address) { Address = address; }
        public void SetCity(string? city) { City = city; }
        public void SetState(string? state) { State = state; }
        public void SetCountry(string? country) { Country = country; }
        public void SetPostalCode(string? postalCode) { PostalCode = postalCode; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetLicenseNumber(string? licenseNumber) { LicenseNumber = licenseNumber; }
        public void SetGmpCertified(bool gmpCertified) { GmpCertified = gmpCertified; }
        public void SetIsoCertified(bool isoCertified) { IsoCertified = isoCertified; }
        public void SetFdaApproved(bool fdaApproved) { FdaApproved = fdaApproved; }
        public void SetEstablishedYear(int establishedYear) { EstablishedYear = establishedYear; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
