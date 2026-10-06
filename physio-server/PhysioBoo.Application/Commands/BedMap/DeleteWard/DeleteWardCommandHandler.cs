using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.DeleteWard
{
    public sealed class DeleteWardCommandHandler : CommandHandlerBase, IRequestHandler<DeleteWardCommand>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IBedRepository _bedRepository;

        public DeleteWardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IWardRepository wardRepository,
            IBedRepository bedRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _wardRepository = wardRepository;
            _bedRepository = bedRepository;
        }

        public async Task Handle(DeleteWardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Inpatient.Ward? ward = await _wardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (ward == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Ward with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // Remove or move the beds first, so no bed is left pointing at a deleted ward.
            if (await _bedRepository.ExistsAsync(b => b.WardId == request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This ward still has beds. Remove its beds first.",
                    DomainErrorCodes.Ward.HasBeds
                ));
                return;
            }

            _wardRepository.SoftDeleteSingle(ward, false, cancellationToken);

            await CommitAsync();
        }
    }
}
