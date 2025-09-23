namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    public sealed record CreateHospitalGroupViewModel
    (
        Guid Id,
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
