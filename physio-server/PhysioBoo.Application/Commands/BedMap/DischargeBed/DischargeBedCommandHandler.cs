using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.DischargeBed
{
    public sealed class DischargeBedCommandHandler : CommandHandlerBase, IRequestHandler<DischargeBedCommand>
    {
        private readonly IBedRepository _bedRepository;

        public DischargeBedCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBedRepository bedRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _bedRepository = bedRepository;
        }

        public async Task Handle(DischargeBedCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // Closes the stay, frees the bed and discharges the linked admission, all in one transaction.
            SharedKernel.Results.DbResult<Guid> result = await _bedRepository.DischargeAsync(
                request.BedId,
                request.Input.DischargeDate ?? TimeZoneHelper.GetLocalTimeNow(),
                string.IsNullOrWhiteSpace(request.Input.Notes) ? null : request.Input.Notes.Trim(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    BedOperationErrors.Describe(result.Error),
                    result.Error ?? ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
