namespace PhysioBoo.Application.ViewModels.Roles
{
    /// <summary>
    /// Represents filter criteria when querying roles.
    /// </summary>
    public class RoleFilter
    {
        /// <summary>
        /// Filter by active status.
        /// </summary>
        public bool? IsActive { get; set; }
    }
}
