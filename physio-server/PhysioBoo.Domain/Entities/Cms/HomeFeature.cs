namespace PhysioBoo.Domain.Entities.Cms
{
    public class HomeFeature : TenantEntity
    {
        #region Core HomeFeature Table (5)
        public string? Icon { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public int Order { get; private set; }
        public bool Active { get; private set; }
        #endregion

        #region Constructor (5)
        public HomeFeature(
            Guid id,
            string? icon,
            string title,
            string? description,
            int order,
            bool active
        ) : base(id)
        {
            Icon = icon;
            Title = title;
            Description = description;
            Order = order;
            Active = active;
        }
        #endregion

        #region Setter Methods (5)
        public void SetIcon(string? icon) { Icon = icon; }
        public void SetTitle(string title) { Title = title; }
        public void SetDescription(string? description) { Description = description; }
        public void SetOrder(int order) { Order = order; }
        public void SetActive(bool active) { Active = active; }
        #endregion
    }
}
