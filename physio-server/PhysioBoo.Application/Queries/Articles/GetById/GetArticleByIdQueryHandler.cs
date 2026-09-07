
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Articles.GetById
{
    public sealed class GetArticleByIdQueryHandler : IRequestHandler<GetArticleByIdQuery, ArticleViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IArticleRepository _articleRepository;

        public GetArticleByIdQueryHandler(
            IMediatorHandler bus,
            IArticleRepository articleRepository
        )
        {
            _bus = bus;
            _articleRepository = articleRepository;
        }

        public async Task<ArticleViewModel?> Handle(GetArticleByIdQuery request, CancellationToken ct)
        {
            Article? article = await _articleRepository.GetByIdAsync(request.Id, ct: ct);

            if (article == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetArticleByIdQuery),
                    $"Article with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return ArticleViewModel.FromArticle(article);
        }
    }
}
