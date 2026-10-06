using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateRoomStatus
{
    public sealed class UpdateRoomStatusCommandHandler : CommandHandlerBase, IRequestHandler<UpdateRoomStatusCommand>
    {
        private readonly IOperatingRoomRepository _roomRepository;
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public UpdateRoomStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IOperatingRoomRepository roomRepository,
            ISurgeryCaseRepository surgeryRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _roomRepository = roomRepository;
            _surgeryRepository = surgeryRepository;
            _user = user;
        }

        public async Task Handle(UpdateRoomStatusCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _roomRepository.ExistsAsync(request.RoomId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Operating room with id {request.RoomId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            OperatingRoomStatus status = Enum.Parse<OperatingRoomStatus>(request.Input.Status, true);

            // A room with an operation under way keeps showing "In surgery": staff cannot mark it free or closed.
            if (status != OperatingRoomStatus.InSurgery && await _surgeryRepository.ExistsAsync(
                c => c.OperatingRoomId == request.RoomId
                    && (c.Status == SurgeryStatus.AnesthesiaStarted || c.Status == SurgeryStatus.InProgress),
                cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This room has an operation in progress.",
                    DomainErrorCodes.Surgery.RoomInUse
                ));
                return;
            }

            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            await _roomRepository.BatchUpdateMultipleAsync(
                r => r.Id == request.RoomId,
                s => s
                    .SetProperty(r => r.Status, status)
                    .SetProperty(r => r.UpdatedBy, userId)
                    .SetProperty(r => r.UpdatedAt, updatedAt),
                cancellationToken
            );
        }
    }
}
