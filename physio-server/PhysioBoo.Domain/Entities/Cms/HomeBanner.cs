namespace PhysioBoo.Domain.Entities.Cms
{
    public class HomeBanner : TenantEntity
    {
        #region Core HomeBanner Table (7)
        public string Title { get; private set; }
        public string? Subtitle { get; private set; }
        public string? ImageUrl { get; private set; }
        public string? ButtonText { get; private set; }
        public string? ButtonLink { get; private set; }
        public int Order { get; private set; }
        public bool Active { get; private set; }
        #endregion

        #region Constructor (7)
        public HomeBanner(
            Guid id,
            string title,
            string? subtitle,
            string? imageUrl,
            string? buttonText,
            string? buttonLink,
            int order,
            bool active
        ) : base(id)
        {
            Title = title;
            Subtitle = subtitle;
            ImageUrl = imageUrl;
            ButtonText = buttonText;
            ButtonLink = buttonLink;
            Order = order;
            Active = active;
        }
        #endregion

        #region Setter Methods (7)
        public void SetTitle(string title) { Title = title; }
        public void SetSubtitle(string? subtitle) { Subtitle = subtitle; }
        public void SetImageUrl(string? imageUrl) { ImageUrl = imageUrl; }
        public void SetButtonText(string? buttonText) { ButtonText = buttonText; }
        public void SetButtonLink(string? buttonLink) { ButtonLink = buttonLink; }
        public void SetOrder(int order) { Order = order; }
        public void SetActive(bool active) { Active = active; }
        #endregion
    }
}
