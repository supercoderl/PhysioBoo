namespace PhysioBoo.Application.ViewModels.UserPreferences
{
    public sealed record UpsertUserPreferenceViewModel
    (
        IReadOnlyList<PreferenceItem> Preferences
    );

    public class PreferenceItem
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
    }
}
