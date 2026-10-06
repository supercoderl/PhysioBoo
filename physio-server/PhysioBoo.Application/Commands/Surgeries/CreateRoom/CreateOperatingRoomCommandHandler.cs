using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.CreateRoom
{
    public sealed class CreateOperatingRoomCommandHandler : CommandHandlerBase, IRequestHandler<CreateOperatingRoomCommand>
    {
        private readonly IOperatingRoomRepository _roomRepository;
        private readonly IUser _user;

        public CreateOperatingRoomCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IOperatingRoomRepository roomRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _roomRepository = roomRepository;
            _user = user;
        }

        public async Task Handle(CreateOperatingRoomCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string roomNumber = request.NewRoom.RoomNumber.Trim();

            if (await _roomRepository.ExistsAsync(r => r.RoomNumber == roomNumber, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Operating room {roomNumber} already exists.",
                    DomainErrorCodes.Surgery.DuplicateRoomNumber
                ));
                return;
            }

            OperatingRoom room = new OperatingRoom(request.NewId, roomNumber, request.NewRoom.RoomType.Trim());
            room.SetTenantId(_user.GetTenantId());
            room.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _roomRepository.InsertAsync<OperatingRoom, Guid>(room);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create operating room: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = new OperatingRoomViewModel
            {
                Id = room.Id,
                RoomNumber = room.RoomNumber,
                RoomType = room.RoomType,
                Status = room.Status.ToString(),
                EquipmentReady = room.EquipmentReady
            };
        }
    }
}
