using PhysioBoo.Application.Queries.Articles.GetAll;
using PhysioBoo.Application.SortProviders;
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Common;
using Xunit;

namespace PhysioBoo.Application.Test.Queries
{
    public sealed class ArticlesSearchSpecTest
    {
        private static readonly Article[] s_articles =
        [
            Create("published", ArticleStatus.Published),
            Create("draft", ArticleStatus.Draft),
            Create("archived", ArticleStatus.Archived)
        ];

        private static Article Create(string title, ArticleStatus status)
            => new(Guid.NewGuid(), title, title, ArticleCategory.Medical, null, null, "x", "x", "x", status, null, null);

        private static string[] Search(ArticleFilter? filter)
        {
            PagedRequest<ArticleFilter> request = new() { Filter = filter };
            ArticlesSearchSpec spec = new(new GetAllArticlesQuery(request), new ArticleViewModelSortProvider());
            return spec.Evaluate(s_articles).Select(a => a.Title).OrderBy(x => x).ToArray();
        }

        [Fact]
        public void Without_Status_Only_Published_Are_Returned()
            => Assert.Equal(["published"], Search(new ArticleFilter("", "", null, null)));

        [Fact]
        public void Explicit_Status_Is_Honoured()
            => Assert.Equal(["draft"], Search(new ArticleFilter("", "", null, ArticleStatus.Draft)));

        [Fact]
        public void IncludeUnpublished_Returns_Every_Status()
            => Assert.Equal(["archived", "draft", "published"], Search(new ArticleFilter("", "", null, null, true)));
    }
}
