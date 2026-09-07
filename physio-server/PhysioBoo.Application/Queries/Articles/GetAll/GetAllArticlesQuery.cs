
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Articles.GetAll
{
    public sealed record GetAllArticlesQuery(
        PagedRequest<ArticleFilter> Request
    ) : IRequest<PagedResult<ArticleViewModel>>;
}
