namespace PhysioBoo.Application.ViewModels.Manufacturers
{
    public sealed record UpdateManufacturerViewModel
    (
        string Name,
        string? Address,
        string? City,
        string? State,
        string? Country,
        string? PostalCode,
        string? Phone,
        string? Email,
        string? Website,
        string? LicenseNumber,
        bool GmpCertified,
        bool IsoCertified,
        bool FdaApproved,
        int EstablishedYear,
        bool IsActive
    );
}
