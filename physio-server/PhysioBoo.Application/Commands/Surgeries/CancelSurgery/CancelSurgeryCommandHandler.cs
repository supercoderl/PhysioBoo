using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.CancelSurgery
{
    public sealed class CancelSurgeryCommandHandler : CommandHandlerBase, IRequestHandler<CancelSurgeryCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public CancelSurgeryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _user = user;
        }

        public async Task Handle(CancelSurgeryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _surgeryRepository.ExistsAsync(request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Surgery with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            Guid? userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? cancelledAt = now;
            DateTime? updatedAt = now;
            string? cancelReason = request.Input.Reason.Trim();

            // Only a case that has not gone to theatre can be cancelled; the status guard makes it atomic.
            int updated = await _surgeryRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.Id
                    && (c.Status == SurgeryStatus.Scheduled || c.Status == SurgeryStatus.PatientArrived || c.Status == SurgeryStatus.PreOpReady),
                s => s
                    .SetProperty(c => c.Status, SurgeryStatus.Cancelled)
                    .SetProperty(c => c.CancelReason, cancelReason)
                    .SetProperty(c => c.CancelledAt, cancelledAt)
                    .SetProperty(c => c.UpdatedBy, userId)
                    .SetProperty(c => c.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This surgery can no longer be cancelled.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            SurgeryCase? surgery = await _surgeryRepository.GetWithLinksAsync(request.Id, cancellationToken);
            if (surgery != null) request.Result = SurgeryCaseViewModel.FromCase(surgery, now);
        }
    }
}
