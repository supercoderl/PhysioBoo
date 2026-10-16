using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Public
{
    // Public website (anonymous) clinic contracts. Only fields that are safe to publish:
    // no licence, accreditation, capacity, emergency/ambulance lines, coordinates or insurance data.

    public sealed record PublicHospitalFilter
    {
        public HospitalType? Type { get; init; }
    }

    public sealed record PublicHospitalViewModel(
        Guid Id,
        string Name,
        HospitalType HospitalType,
        string? Address,
        string? City,
        string? StateProvince,
        string? Phone,
        string? Description,
        // First listed photo, else the logo; null shows a placeholder.
        string? ImageUrl,
        bool Is24Hours,
        IReadOnlyList<string> Languages
    );

    public sealed record PublicHospitalDetailViewModel(
        Guid Id,
        string Name,
        HospitalType HospitalType,
        string? Address,
        string? City,
        string? StateProvince,
        string? Phone,
        string? Email,
        // Absolute http(s) URL only.
        string? Website,
        string? Description,
        string? LogoUrl,
        // First listed photo; unlike the card, the logo is shown separately.
        string? ImageUrl,
        bool Is24Hours,
        IReadOnlyList<string> Languages,
        // Names of the services published at this clinic.
        IReadOnlyList<string> Services
    );
}
