namespace PhysioBoo.Application.ViewModels.Addresses
{
    public sealed record CreateAddressViewModel
    (
        Guid Id,
        string Street,
        string? ApartmentUnit,
        string City,
        string StateProvince,
        string? PostalCode,
        string Country,
        decimal Latitude,
        decimal Longitude
    );
}
