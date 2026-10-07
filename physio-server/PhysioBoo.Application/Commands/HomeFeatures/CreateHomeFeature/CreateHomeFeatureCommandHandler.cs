using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeFeatures.CreateHomeFeature
{
    public sealed class CreateHomeFeatureCommandHandler : CommandHandlerBase, IRequestHandler<CreateHomeFeatureCommand>
    {
        private readonly IHomeFeatureRepository _repository;
        private readonly IUser _user;

        public CreateHomeFeatureCommandHandler(
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

        public async Task Handle(CreateHomeFeatureCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SaveHomeFeatureViewModel vm = request.HomeFeature;

            HomeFeature entity = new HomeFeature(
                request.NewId,
                vm.Icon?.Trim(),
                vm.Title!.Trim(),
                vm.Description?.Trim(),
                vm.Order ?? 1,
                vm.Active ?? true
            );

            entity.SetTenantId(_user.GetTenantId());
            entity.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _repository.InsertAsync<HomeFeature, Guid>(entity);

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
