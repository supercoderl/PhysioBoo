using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Application.ViewModels.HomeContent
{
    public sealed record HomeFeatureViewModel(
        Guid Id,
        string? Icon,
        string Title,
        string? Description,
        int Order,
        bool Active
    )
    {
        public static HomeFeatureViewModel FromEntity(HomeFeature e)
        {
            return new HomeFeatureViewModel(
                e.Id,
                e.Icon,
                e.Title,
                e.Description,
                e.Order,
                e.Active
            );
        }
    }
}
