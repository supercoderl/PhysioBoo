
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Articles.GetAll
{
    public sealed class GetAllArticlesQueryHandler : IRequestHandler<GetAllArticlesQuery, PagedResult<ArticleViewModel>>
    {
        private readonly IArticleRepository _articleRepository;
        private readonly ISortingExpressionProvider<ArticleViewModel, Article> _sortingExpressionProvider;

        public GetAllArticlesQueryHandler(
            IArticleRepository articleRepository,
            ISortingExpressionProvider<ArticleViewModel, Article> sortingExpressionProvider
        )
        {
            _articleRepository = articleRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<ArticleViewModel>> Handle(GetAllArticlesQuery q, CancellationToken ct)
        {
            ArticlesSearchSpec spec = new ArticlesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Article> paged = await _articleRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<ArticleViewModel> items = paged.Items.Select(a => ArticleViewModel.FromArticle(a)).ToList();
            return new PagedResult<ArticleViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
