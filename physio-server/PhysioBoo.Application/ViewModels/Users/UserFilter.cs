namespace PhysioBoo.Application.ViewModels.Users
{
    /// <summary>
    /// Represents filter criteria when querying users.
    /// </summary>
    public class UserFilter
    {
        /// <summary>
        /// Filter by active status.
        /// </summary>
        public bool? IsActive { get; set; }
    }
}
