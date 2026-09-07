
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Articles.UpdateArticle
{
    public sealed class UpdateArticleCommandHandler : CommandHandlerBase, IRequestHandler<UpdateArticleCommand>
    {
        private readonly IArticleRepository _articleRepository;

        public UpdateArticleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IArticleRepository articleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _articleRepository = articleRepository;
        }

        public async Task Handle(UpdateArticleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Cms.Article? article = await _articleRepository.GetByIdAsync(request.Id);

            if (article == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Article with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            article.SetTitle(request.Article.Title);
            article.SetSlug(request.Article.Slug);
            article.SetAuthor(request.Article.Author);
            article.SetCategory(request.Article.Category);
            article.SetTags(request.Article.Tags);
            article.SetCoverImageUrl(request.Article.CoverImageUrl);
            article.SetExcerpt(request.Article.Excerpt);
            article.SetContent(request.Article.Content);
            article.SetStatus(request.Article.Status);
            article.SetPublishDate(request.Article.PublishDate);
            article.SetReadTime(request.Article.ReadTime);
            article.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

            await _articleRepository.UpdateTrackedAsync(article, ct);
        }
    }
}
