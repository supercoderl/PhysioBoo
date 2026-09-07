
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Articles.CreateArticle
{
    public sealed class CreateArticleCommandHandler : CommandHandlerBase, IRequestHandler<CreateArticleCommand>
    {
        private readonly IArticleRepository _articleRepository;

        public CreateArticleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IArticleRepository articleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _articleRepository = articleRepository;
        }

        public async Task Handle(CreateArticleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Article article = new Article(
                request.NewId,
                request.NewArticle.Title,
                request.NewArticle.Slug,
                request.NewArticle.Category,
                request.NewArticle.Tags,
                request.NewArticle.CoverImageUrl,
                request.NewArticle.Excerpt,
                request.NewArticle.Content,
                request.NewArticle.Author,
                request.NewArticle.Status,
                request.NewArticle.PublishDate,
                request.NewArticle.ReadTime
            );

            SharedKernel.Results.DbResult<Guid> result = await _articleRepository.InsertAsync<Article, Guid>(article);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
