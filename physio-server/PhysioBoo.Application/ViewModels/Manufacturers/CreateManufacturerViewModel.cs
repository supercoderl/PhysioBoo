namespace PhysioBoo.Application.ViewModels.Manufacturers
{
    public sealed record CreateManufacturerViewModel
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
        int EstablishedYear
    );
}
