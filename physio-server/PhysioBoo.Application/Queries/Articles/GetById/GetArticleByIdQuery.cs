
using PhysioBoo.Application.ViewModels.Articles;

namespace PhysioBoo.Application.Queries.Articles.GetById
{
    public sealed record GetArticleByIdQuery(Guid Id) : IRequest<ArticleViewModel?>;
}
