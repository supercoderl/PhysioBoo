namespace PhysioBoo.Domain.Entities.Academy
{
    // Staff training course. A draft is visible only to people who manage the academy.
    public class Course : TenantEntity
    {
        #region Core Course Table (4)
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public string Category { get; private set; }
        public bool IsPublished { get; private set; }
        #endregion

        #region Constructor (4)
        public Course(
            Guid id,
            string title,
            string? description,
            string category,
            bool isPublished
        ) : base(id)
        {
            Title = title;
            Description = description;
            Category = category;
            IsPublished = isPublished;
        }
        #endregion

        #region Setter Methods (4)
        public void SetTitle(string title) { Title = title; }
        public void SetDescription(string? description) { Description = description; }
        public void SetCategory(string category) { Category = category; }
        public void SetIsPublished(bool isPublished) { IsPublished = isPublished; }
        #endregion
    }
}
