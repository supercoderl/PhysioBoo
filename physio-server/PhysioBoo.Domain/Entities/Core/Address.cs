using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class Address : Entity
    {
        #region Core Address Table (13)
        public Guid UserId { get; private set; }
        public AddressType AddressType { get; private set; }
        public string Street { get; private set; }
        public string? ApartmentUnit { get; private set; }
        public string City { get; private set; }
        public string StateProvince { get; private set; }
        public string? PostalCode { get; private set; }
        public string Country { get; private set; }
        public decimal Latitude { get; private set; }
        public decimal Longitude { get; private set; }
        public bool IsPrimary { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("UserId")]
        [InverseProperty("Addresses")]
        public virtual User? User { get; private set; }
        #endregion

        #region Constructor (13)
        public Address(
            Guid id,
            Guid userId,
            string street,
            string? apartmentUnit,
            string city,
            string stateProvince,
            string? postalCode,
            string country,
            decimal latitude,
            decimal longitude
        ) : base(id)
        {
            UserId = userId;
            AddressType = AddressType.Home; // Default to Home, can be changed later
            Street = street;
            ApartmentUnit = apartmentUnit;
            City = city;
            StateProvince = stateProvince;
            PostalCode = postalCode;
            Country = country;
            Latitude = latitude;
            Longitude = longitude;
            IsPrimary = false; // Default to false, can be changed later
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (13)
        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetAddressType(AddressType addressType) { AddressType = addressType; }
        public void SetStreet(string street) { Street = street; }
        public void SetApartmentUnit(string? apartmentUnit) { ApartmentUnit = apartmentUnit; }
        public void SetCity(string city) { City = city; }
        public void SetStateProvince(string stateProvince) { StateProvince = stateProvince; }
        public void SetPostalCode(string? postalCode) { PostalCode = postalCode; }
        public void SetCountry(string country) { Country = country; }
        public void SetLatitude(decimal latitude) { Latitude = latitude; }
        public void SetLongitude(decimal longitude) { Longitude = longitude; }
        public void SetIsPrimary(bool isPrimary) { IsPrimary = isPrimary; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt() { UpdatedAt = TimeZoneHelper.GetLocalTimeNow(); }
        #endregion
    }
}
