using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeFeatures.DeleteHomeFeature
{
    public sealed class DeleteHomeFeatureCommandHandler : CommandHandlerBase, IRequestHandler<DeleteHomeFeatureCommand>
    {
        private readonly IHomeFeatureRepository _repository;

        public DeleteHomeFeatureCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeFeatureRepository repository
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteHomeFeatureCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HomeFeature? entity = await _repository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (entity == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Home feature with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _repository.SoftDeleteSingle(entity, false, cancellationToken);

            await CommitAsync();
        }
    }
}
