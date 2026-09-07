
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.WarehouseZones.UpdateWarehouseZone
{
    public sealed class UpdateWarehouseZoneCommandHandler : CommandHandlerBase, IRequestHandler<UpdateWarehouseZoneCommand>
    {
        private readonly IWarehouseZoneRepository _warehouseZoneRepository;

        public UpdateWarehouseZoneCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IWarehouseZoneRepository warehouseZoneRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _warehouseZoneRepository = warehouseZoneRepository;
        }

        public async Task Handle(UpdateWarehouseZoneCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            WarehouseZone? zone = await _warehouseZoneRepository.GetByIdAsync(request.Id);

            if (zone == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Warehouse zone with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            zone.SetName(request.WarehouseZone.Name);
            zone.SetType(request.WarehouseZone.Type);

            await _warehouseZoneRepository.UpdateTrackedAsync(zone, ct);
        }
    }
}
