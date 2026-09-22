namespace PhysioBoo.Application.ViewModels.HomeSettings
{
    public sealed record UpdateHomeSettingViewModel(
        string HospitalName,
        string? TagLine,
        string? WelcomeMessage,
        string? ContactPhone,
        string? ContactEmail,
        string? Address,
        bool ShowEmergencyBanner
    );
}
