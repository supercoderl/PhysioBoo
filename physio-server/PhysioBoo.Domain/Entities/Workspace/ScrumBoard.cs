namespace PhysioBoo.Domain.Entities.Workspace
{
    // Shared by everyone in the tenant; only the creator (CreatedBy) can delete it.
    public class ScrumBoard : TenantEntity
    {
        #region Core ScrumBoard Table (2)
        public string Title { get; private set; }
        public string? Description { get; private set; }
        #endregion

        #region Constructor (2)
        public ScrumBoard(
            Guid id,
            string title,
            string? description
        ) : base(id)
        {
            Title = title;
            Description = description;
        }
        #endregion

        #region Setter Methods (2)
        public void SetTitle(string title) { Title = title; }
        public void SetDescription(string? description) { Description = description; }
        #endregion
    }
}
