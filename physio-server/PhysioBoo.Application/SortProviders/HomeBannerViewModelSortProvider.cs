using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class HomeBannerViewModelSortProvider : ISortingExpressionProvider<HomeBannerViewModel, HomeBanner>
    {
        private static readonly Dictionary<string, Expression<Func<HomeBanner, object>>> s_expressions = new()
        {
            { "title", x => x.Title }, { "order", x => x.Order }, { "createdat", x => x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<HomeBanner, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
