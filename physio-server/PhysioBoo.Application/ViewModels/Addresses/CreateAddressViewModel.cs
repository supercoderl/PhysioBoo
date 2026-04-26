namespace PhysioBoo.Application.ViewModels.Addresses
{
    public sealed record CreateAddressViewModel
    (
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
