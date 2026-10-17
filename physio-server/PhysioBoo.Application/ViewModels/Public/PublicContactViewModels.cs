namespace PhysioBoo.Application.ViewModels.Public
{
    // Public website (anonymous) contact form contracts.

    public sealed record PublicContactMessageViewModel(
        string FullName,
        string Phone,
        string? Email,
        // One of PublicContactTopics; optional.
        string? Topic,
        // A clinic of the site's tenant; optional ("No preference").
        Guid? ClinicId,
        string Message,
        bool Consent,
        // Honeypot: a hidden field people never fill in. Anything here means a bot.
        string? Website
    );

    public sealed record PublicContactMessageResultViewModel(string Reference);
}
