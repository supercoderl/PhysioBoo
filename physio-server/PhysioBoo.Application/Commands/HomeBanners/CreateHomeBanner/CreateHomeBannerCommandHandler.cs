using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeBanners.CreateHomeBanner
{
    public sealed class CreateHomeBannerCommandHandler : CommandHandlerBase, IRequestHandler<CreateHomeBannerCommand>
    {
        private readonly IHomeBannerRepository _repository;
        private readonly IUser _user;

        public CreateHomeBannerCommandHandler(
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

        public async Task Handle(CreateHomeBannerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SaveHomeBannerViewModel vm = request.HomeBanner;

            HomeBanner entity = new HomeBanner(
                request.NewId,
                vm.Title!.Trim(),
                vm.Subtitle?.Trim(),
                vm.ImageUrl?.Trim(),
                vm.ButtonText?.Trim(),
                vm.ButtonLink?.Trim(),
                vm.Order ?? 1,
                vm.Active ?? true
            );

            entity.SetTenantId(_user.GetTenantId());
            entity.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _repository.InsertAsync<HomeBanner, Guid>(entity);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
