using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Addresses
{
    public sealed record UpdateAddressViewModel
    (
        AddressType AddressType,
        string Street,
        string? ApartmentUnit,
        string City,
        string StateProvince,
        string? PostalCode,
        string Country,
        decimal Latitude,
        decimal Longitude,
        bool IsPrimary
    );
}
