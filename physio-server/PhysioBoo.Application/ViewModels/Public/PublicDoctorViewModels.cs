namespace PhysioBoo.Application.ViewModels.Public
{
    // Public website (anonymous) doctor contracts. Only fields that are safe to publish:
    // no licence, fee, bank/tax, employment or rating data.

    public sealed record PublicDoctorFilter
    {
        public Guid? SpecialtyId { get; init; }
        public Guid? HospitalId { get; init; }
        public bool? Online { get; init; }
        public bool? HomeVisit { get; init; }
    }

    public sealed record PublicDoctorViewModel(
        Guid Id,
        string FullName,
        string? AvatarUrl,
        string? Specialty,
        IReadOnlyList<string> Facilities,
        string? Bio,
        bool IsVerified,
        // Only published for verified doctors, so unverified profiles can't advertise experience.
        int? YearsOfExperience,
        bool IsAvailableOnline,
        bool IsAvailableHomeVisit
    );

    public sealed record PublicFacilityViewModel(Guid Id, string Name, string? Address, string? Phone);

    public sealed record PublicDoctorDetailViewModel(
        Guid Id,
        string FullName,
        string? AvatarUrl,
        string? Specialty,
        bool IsVerified,
        string? Bio,
        string? About,
        string? ResearchInterests,
        // Recognition and experience are only published for verified doctors.
        string? Achievements,
        int? YearsOfExperience,
        IReadOnlyList<string> Languages,
        bool IsAvailableOnline,
        bool IsAvailableHomeVisit,
        IReadOnlyList<string> Services,
        IReadOnlyList<PublicFacilityViewModel> Facilities
    );

    /// <summary>Appointment request from an anonymous visitor. Stored as a CRM lead for the clinic to call back.</summary>
    public sealed record PublicAppointmentRequestViewModel(
        Guid DoctorId,
        Guid? FacilityId,
        string? Service,
        string FullName,
        string Phone,
        string? Email,
        // Honeypot: a hidden field people never fill in. Anything here means a bot.
        string? Website
    );

    public sealed record PublicAppointmentRequestResultViewModel(string Reference);

    public sealed record PublicOption(Guid Id, string Name);

    public sealed record PublicDoctorFilterOptionsViewModel(
        IReadOnlyList<PublicOption> Specialties,
        IReadOnlyList<PublicOption> Facilities
    );
}
