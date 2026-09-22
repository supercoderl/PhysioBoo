using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.HomeSettings
{
    public sealed class HomeSettingsViewModel
    {
        public string HospitalName { get; set; } = string.Empty;
        public string? TagLine { get; set; }
        public string? WelcomeMessage { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? Address { get; set; }
        public bool ShowEmergencyBanner { get; set; }

        public static HomeSettingsViewModel FromEntity(HomeSetting entity)
        {
            return new HomeSettingsViewModel
            {
                HospitalName = entity.HospitalName,
                TagLine = entity.TagLine,
                WelcomeMessage = entity.WelcomeMessage,
                ContactPhone = entity.ContactPhone,
                ContactEmail = entity.ContactEmail,
                Address = entity.Address,
                ShowEmergencyBanner = entity.ShowEmergencyBanner
            };
        }
    }
}
