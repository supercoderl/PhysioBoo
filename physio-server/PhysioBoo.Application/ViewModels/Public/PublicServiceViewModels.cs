namespace PhysioBoo.Application.ViewModels.Public
{
    // Public website (anonymous) service contracts. Only fields that are safe to publish:
    // no price, currency, VAT, duration, availability, referral, code, tags or departments.

    public sealed record PublicServiceFilter
    {
        public Guid? HospitalId { get; init; }
    }

    public sealed record PublicServiceViewModel(
        Guid Id,
        string Name,
        string? Description,
        // Null shows a placeholder.
        string? CoverImageUrl,
        // Set only when the clinic is public.
        Guid? HospitalId,
        string? HospitalName,
        // A publicly listed doctor who delivers the service; null when appointments go through the clinic or nowhere.
        Guid? DoctorId
    );

    public sealed record PublicServiceFilterOptionsViewModel(
        IReadOnlyList<PublicOption> Clinics
    );

    public sealed record PublicServiceDetailViewModel(
        Guid Id,
        string Name,
        // Paragraphs separated by blank lines; the first is the summary.
        string? Description,
        string? CoverImageUrl,
        // The one public clinic the service is listed at, if any.
        PublicHospitalViewModel? Clinic,
        // Publicly listed doctors who deliver it (at the clinic, when there is one). At most six.
        IReadOnlyList<PublicDoctorViewModel> Doctors
    );
}
