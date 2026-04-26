using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Addresses
{
    public sealed class AddressViewModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public AddressType AddressType { get; set; }
        public string Street { get; set; } = string.Empty;
        public string? ApartmentUnit { get; set; }
        public string City { get; set; } = string.Empty;
        public string StateProvince { get; set; } = string.Empty;
        public string? PostalCode { get; set; }
        public string Country { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public bool IsPrimary { get; set; }

        public static AddressViewModel FromAddress(Address address)
        {
            return new AddressViewModel
            {
                Id = address.Id,
                UserId = address.UserId,
                AddressType = address.AddressType,
                Street = address.Street,
                ApartmentUnit = address.ApartmentUnit,
                City = address.City,
                StateProvince = address.StateProvince,
                PostalCode = address.PostalCode,
                Country = address.Country,
                Latitude = address.Latitude,
                Longitude = address.Longitude,
                IsPrimary = address.IsPrimary
            };
        }
    }
}
