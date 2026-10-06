using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.DeleteBed
{
    public sealed class DeleteBedCommandHandler : CommandHandlerBase, IRequestHandler<DeleteBedCommand>
    {
        private readonly IBedRepository _bedRepository;

        public DeleteBedCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBedRepository bedRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _bedRepository = bedRepository;
        }

        public async Task Handle(DeleteBedCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Bed? bed = await _bedRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (bed == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Bed with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (bed.Status == BedStatus.Occupied)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "An occupied bed can't be deleted. Discharge the patient first.",
                    DomainErrorCodes.Bed.Occupied
                ));
                return;
            }

            // Soft delete: the stay history keeps pointing at the bed.
            _bedRepository.SoftDeleteSingle(bed, false, cancellationToken);

            await CommitAsync();
        }
    }
}
