namespace PhysioBoo.Application.ViewModels.Sys_Languages
{
    /// <summary>
    /// Represents filter criteria when querying languages.
    /// </summary>
    public class LanguageFilter
    {
        /// <summary>
        /// Filter by active status.
        /// </summary>
        public bool? IsActive { get; set; }
    }
}
