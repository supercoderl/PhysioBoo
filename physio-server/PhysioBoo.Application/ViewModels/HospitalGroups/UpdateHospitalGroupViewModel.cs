namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    public sealed record UpdateHospitalGroupViewModel
    (
        string Name,
        string? Description,
        string? HeadquartersAddress,
        string? Website,
        string? Phone,
        string? Email,
        string? LogoUrl,
        DateTime? EstablishedDate,
        string? LicenseNumber,
        string? AccreditationDetails
    );
}
