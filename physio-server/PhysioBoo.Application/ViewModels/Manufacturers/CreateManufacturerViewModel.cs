namespace PhysioBoo.Application.ViewModels.Manufacturers
{
    public sealed record CreateManufacturerViewModel
    (
        Guid Id,
        string Name,
        string? CompanyCode,
        string? Address,
        string? City,
        string? State,
        string? Country,
        string? PostalCode,
        string? Phone,
        string? Email,
        string? Website,
        string? LicenseNumber,
        int EstablishedYear
    );
}
