using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class HomeFeatureViewModelSortProvider : ISortingExpressionProvider<HomeFeatureViewModel, HomeFeature>
    {
        private static readonly Dictionary<string, Expression<Func<HomeFeature, object>>> s_expressions = new()
        {
            { "title", x => x.Title }, { "order", x => x.Order }, { "createdat", x => x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<HomeFeature, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
