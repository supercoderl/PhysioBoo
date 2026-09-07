
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.WarehouseZones.CreateWarehouseZone
{
    public sealed class CreateWarehouseZoneCommandHandler : CommandHandlerBase, IRequestHandler<CreateWarehouseZoneCommand>
    {
        private readonly IWarehouseZoneRepository _warehouseZoneRepository;
        private readonly IUser _user;

        public CreateWarehouseZoneCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IWarehouseZoneRepository warehouseZoneRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _warehouseZoneRepository = warehouseZoneRepository;
            _user = user;
        }

        public async Task Handle(CreateWarehouseZoneCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            WarehouseZone newZone = new WarehouseZone(
                request.NewWarehouseZone.Id,
                request.NewWarehouseZone.HospitalId,
                request.NewWarehouseZone.Name,
                request.NewWarehouseZone.Type
            );

            newZone.SetTenantId(_user.GetTenantId());
            newZone.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _warehouseZoneRepository.InsertAsync<WarehouseZone, Guid>(newZone);

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
