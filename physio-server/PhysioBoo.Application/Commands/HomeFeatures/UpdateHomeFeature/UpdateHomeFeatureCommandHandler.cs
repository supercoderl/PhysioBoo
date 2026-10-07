using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeFeatures.UpdateHomeFeature
{
    public sealed class UpdateHomeFeatureCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHomeFeatureCommand>
    {
        private readonly IHomeFeatureRepository _repository;
        private readonly IUser _user;

        public UpdateHomeFeatureCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeFeatureRepository repository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
            _user = user;
        }

        public async Task Handle(UpdateHomeFeatureCommand request, CancellationToken cancellationToken)
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

            SaveHomeFeatureViewModel vm = request.HomeFeature;

            if (vm.Icon != null)
                entity.SetIcon(string.IsNullOrWhiteSpace(vm.Icon) ? null : vm.Icon.Trim());
            if (vm.Title != null)
                entity.SetTitle(vm.Title.Trim());
            if (vm.Description != null)
                entity.SetDescription(string.IsNullOrWhiteSpace(vm.Description) ? null : vm.Description.Trim());
            if (vm.Order.HasValue)
                entity.SetOrder(vm.Order.Value);
            if (vm.Active.HasValue)
                entity.SetActive(vm.Active.Value);

            entity.SetUpdatedBy(_user.GetUserId());

            await _repository.UpdateTrackedAsync(entity, cancellationToken);
        }
    }
}
