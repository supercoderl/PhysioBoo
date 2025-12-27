namespace PhysioBoo.Application.ViewModels.AdminMenus
{
    /// <summary>
    /// Represents filter criteria when querying menus.
    /// </summary>
    public class AdminMenuFilter
    {
        /// <summary>
        /// Filter by active status.
        /// </summary>
        public bool? IsActive { get; set; }
    }
}
