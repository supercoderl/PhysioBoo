using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Application.ViewModels.HomeContent
{
    public sealed record HomeBannerViewModel(
        Guid Id,
        string Title,
        string? Subtitle,
        string? ImageUrl,
        string? ButtonText,
        string? ButtonLink,
        int Order,
        bool Active
    )
    {
        public static HomeBannerViewModel FromEntity(HomeBanner e)
        {
            return new HomeBannerViewModel(
                e.Id,
                e.Title,
                e.Subtitle,
                e.ImageUrl,
                e.ButtonText,
                e.ButtonLink,
                e.Order,
                e.Active
            );
        }
    }
}
