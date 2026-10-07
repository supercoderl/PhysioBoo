using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeBanners.UpdateHomeBanner
{
    public sealed class UpdateHomeBannerCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHomeBannerCommand>
    {
        private readonly IHomeBannerRepository _repository;
        private readonly IUser _user;

        public UpdateHomeBannerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeBannerRepository repository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
            _user = user;
        }

        public async Task Handle(UpdateHomeBannerCommand request, CancellationToken cancellationToken)
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

            SaveHomeBannerViewModel vm = request.HomeBanner;

            if (vm.Title != null)
                entity.SetTitle(vm.Title.Trim());
            if (vm.Subtitle != null)
                entity.SetSubtitle(string.IsNullOrWhiteSpace(vm.Subtitle) ? null : vm.Subtitle.Trim());
            if (vm.ImageUrl != null)
                entity.SetImageUrl(string.IsNullOrWhiteSpace(vm.ImageUrl) ? null : vm.ImageUrl.Trim());
            if (vm.ButtonText != null)
                entity.SetButtonText(string.IsNullOrWhiteSpace(vm.ButtonText) ? null : vm.ButtonText.Trim());
            if (vm.ButtonLink != null)
                entity.SetButtonLink(string.IsNullOrWhiteSpace(vm.ButtonLink) ? null : vm.ButtonLink.Trim());
            if (vm.Order.HasValue)
                entity.SetOrder(vm.Order.Value);
            if (vm.Active.HasValue)
                entity.SetActive(vm.Active.Value);

            entity.SetUpdatedBy(_user.GetUserId());

            await _repository.UpdateTrackedAsync(entity, cancellationToken);
        }
    }
}
