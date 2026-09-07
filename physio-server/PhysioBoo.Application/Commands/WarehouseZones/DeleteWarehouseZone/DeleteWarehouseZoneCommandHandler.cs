
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.WarehouseZones.DeleteWarehouseZone
{
    public sealed class DeleteWarehouseZoneCommandHandler : CommandHandlerBase, IRequestHandler<DeleteWarehouseZoneCommand>
    {
        private readonly IWarehouseZoneRepository _warehouseZoneRepository;

        public DeleteWarehouseZoneCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IWarehouseZoneRepository warehouseZoneRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _warehouseZoneRepository = warehouseZoneRepository;
        }

        public async Task Handle(DeleteWarehouseZoneCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.WarehouseZone? zone = await _warehouseZoneRepository.GetByIdAsync(request.Id);

            if (zone == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Warehouse zone not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _warehouseZoneRepository.SoftDeleteSingle(zone, request.IsHard, ct);

            await CommitAsync();
        }
    }
}
