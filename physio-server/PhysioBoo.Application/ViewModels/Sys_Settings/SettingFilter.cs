namespace PhysioBoo.Application.ViewModels.Sys_Settings
{
    /// <summary>
    /// Represents filter criteria when querying settings.
    /// </summary>
    public class SettingFilter
    {
        /// <summary>
        /// Filter by system.
        /// </summary>
        public bool? IsSystem { get; set; }
    }
}
