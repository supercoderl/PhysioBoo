using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.UpdateBed
{
    public sealed class UpdateBedCommandHandler : CommandHandlerBase, IRequestHandler<UpdateBedCommand>
    {
        private readonly IBedRepository _bedRepository;
        private readonly IWardRepository _wardRepository;
        private readonly IUser _user;

        public UpdateBedCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBedRepository bedRepository,
            IWardRepository wardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _bedRepository = bedRepository;
            _wardRepository = wardRepository;
            _user = user;
        }

        public async Task Handle(UpdateBedCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _bedRepository.ExistsAsync(request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Bed with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await _wardRepository.ExistsAsync(request.Bed.WardId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Ward with id {request.Bed.WardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string number = request.Bed.Number.Trim();
            if (await _bedRepository.ExistsAsync(b => b.WardId == request.Bed.WardId && b.Number == number && b.Id != request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Bed {number} already exists in this ward.",
                    DomainErrorCodes.Bed.DuplicateNumber
                ));
                return;
            }

            BedTypeText.TryParse(request.Bed.BedType, out BedType bedType);
            BedStatus status = Enum.Parse<BedStatus>(request.Bed.Status, true);
            string? roomNumber = string.IsNullOrWhiteSpace(request.Bed.RoomNumber) ? null : request.Bed.RoomNumber.Trim();
            string? notes = string.IsNullOrWhiteSpace(request.Bed.Notes) ? null : request.Bed.Notes.Trim();
            Guid? userId = _user.GetUserId();
            DateTime? now = TimeZoneHelper.GetLocalTimeNow();

            // Only the columns this command owns, and only while the bed is not occupied. A whole-row update
            // could overwrite Status/CurrentAssignmentId set by a patient being assigned at the same moment.
            int updated = await _bedRepository.BatchUpdateMultipleAsync(
                b => b.Id == request.Id && b.Status != BedStatus.Occupied,
                s => s
                    .SetProperty(b => b.WardId, request.Bed.WardId)
                    .SetProperty(b => b.Number, number)
                    .SetProperty(b => b.RoomNumber, roomNumber)
                    .SetProperty(b => b.Floor, request.Bed.Floor)
                    .SetProperty(b => b.BedType, bedType)
                    .SetProperty(b => b.Status, status)
                    .SetProperty(b => b.IsolationRequired, request.Bed.IsolationRequired)
                    .SetProperty(b => b.Notes, notes)
                    .SetProperty(b => b.UpdatedBy, userId)
                    .SetProperty(b => b.UpdatedAt, now),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "An occupied bed can't be edited. Discharge the patient first.",
                    DomainErrorCodes.Bed.Occupied
                ));
            }
        }
    }
}
