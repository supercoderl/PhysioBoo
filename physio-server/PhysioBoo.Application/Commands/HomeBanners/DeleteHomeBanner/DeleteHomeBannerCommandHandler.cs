using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeBanners.DeleteHomeBanner
{
    public sealed class DeleteHomeBannerCommandHandler : CommandHandlerBase, IRequestHandler<DeleteHomeBannerCommand>
    {
        private readonly IHomeBannerRepository _repository;

        public DeleteHomeBannerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeBannerRepository repository
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteHomeBannerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HomeBanner? entity = await _repository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (entity == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Home banner with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _repository.SoftDeleteSingle(entity, false, cancellationToken);

            await CommitAsync();
        }
    }
}
