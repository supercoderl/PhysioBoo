namespace PhysioBoo.Application.ViewModels.HospitalGroups
{
    public sealed record UpdateHospitalGroupViewModel
    (
        string Name,
        string? Code,
        string? Description,
        string? ContactPerson,
        string? HeadquartersAddress,
        Guid? CountryId,
        Guid? CityId,
        Guid? DistrictId,
        Guid? WardId,
        string? Website,
        string? Phone,
        string? Email,
        string? LogoUrl,
        DateTime? EstablishedDate,
        string? LicenseNumber,
        string? AccreditationDetails
    );
}
