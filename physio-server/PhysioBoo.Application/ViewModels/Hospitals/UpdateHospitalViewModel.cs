using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Hospitals
{
    public sealed record UpdateHospitalViewModel
    (
        Guid HospitalGroupId,
        string Name,
        HospitalType HospitalType,
        int EmergencyCapacity,
        int BedCapacity,
        int IcuCapacity,
        int OperationTheaters,
        string Address,
        string City,
        string StateProvince,
        string? PostalCode,
        string Country,
        string? Phone,
        string? Fax,
        string? Email,
        string? Website,
        string? EmergencyPhone,
        string? AmbulancePhone,
        decimal? Latitude,
        decimal? Longtitude,
        DateTime? EstablishedDate,
        string? LicenseNumber,
        DateTime? LicenseExpiry,
        string AccreditationBody,
        DateTime? AccreditationExpiry,
        string[] InsuranceAccepted,
        string[] LanguagesSupported,
        string? Facilities,
        string? OperatingHours,
        string? LogoUrl,
        string? Images,
        bool Is24Hours,
        bool IsActive,
        string? Description,
        string? MissionStatement,
        string? VisionStatement
    );
}
