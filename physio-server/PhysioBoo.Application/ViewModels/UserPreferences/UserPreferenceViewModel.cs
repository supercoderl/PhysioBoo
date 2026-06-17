using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.UserPreferences
{
    public sealed class UserPreferenceViewModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;

        public static UserPreferenceViewModel FromUserPreference(UserPreference userPreference)
        {
            return new UserPreferenceViewModel
            {
                Id = userPreference.Id,
                UserId = userPreference.UserId,
                Key = userPreference.Key,
                Value = userPreference.Value,
                Group = userPreference.Group
            };
        }
    }
}
