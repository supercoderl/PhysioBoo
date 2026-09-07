
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Articles.DeleteArticle
{
    public sealed class DeleteArticleCommandHandler : CommandHandlerBase, IRequestHandler<DeleteArticleCommand>
    {
        private readonly IArticleRepository _articleRepository;

        public DeleteArticleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IArticleRepository articleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _articleRepository = articleRepository;
        }

        public async Task Handle(DeleteArticleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Cms.Article? article = await _articleRepository.GetByIdAsync(request.Id);

            if (article == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Article not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _articleRepository.SoftDeleteSingle(
                article,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}
