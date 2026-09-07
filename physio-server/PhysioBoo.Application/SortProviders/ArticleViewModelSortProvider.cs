using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class ArticleViewModelSortProvider : ISortingExpressionProvider<ArticleViewModel, Article>
    {
        private static readonly Dictionary<string, Expression<Func<Article, object>>> s_expressions = new()
        {
            { "title", article => article.Title },
            { "author", article => article.Author },
            { "publishdate", article => article.PublishDate ?? DateTime.MinValue },
            { "createdat", article => article.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Article, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
