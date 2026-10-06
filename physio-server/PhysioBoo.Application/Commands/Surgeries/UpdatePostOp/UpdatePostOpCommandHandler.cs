using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.UpdatePostOp
{
    public sealed class UpdatePostOpCommandHandler : CommandHandlerBase, IRequestHandler<UpdatePostOpCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public UpdatePostOpCommandHandler(
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

        public async Task Handle(UpdatePostOpCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _surgeryRepository.ExistsAsync(request.SurgeryId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Surgery with id {request.SurgeryId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // A field that is left out keeps its stored value.
            string? pacuBay = Clean(request.Input.PacuBay);
            string? recoveryStatus = Clean(request.Input.RecoveryStatus);
            string? postOpNotes = Clean(request.Input.PostOpNotes);
            string? complications = Clean(request.Input.Complications);
            string? followUpOrders = Clean(request.Input.FollowUpOrders);
            Guid? userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? updatedAt = now;

            int updated = await _surgeryRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.SurgeryId
                    && (c.Status == SurgeryStatus.ProcedureCompleted || c.Status == SurgeryStatus.Recovery),
                s => s
                    .SetProperty(c => c.PacuBay, c => pacuBay ?? c.PacuBay)
                    .SetProperty(c => c.RecoveryStatus, c => recoveryStatus ?? c.RecoveryStatus)
                    .SetProperty(c => c.PostOpNotes, c => postOpNotes ?? c.PostOpNotes)
                    .SetProperty(c => c.Complications, c => complications ?? c.Complications)
                    .SetProperty(c => c.FollowUpOrders, c => followUpOrders ?? c.FollowUpOrders)
                    .SetProperty(c => c.UpdatedBy, userId)
                    .SetProperty(c => c.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Post-operative data can only be recorded after the procedure is completed and before discharge.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            SurgeryCase? surgery = await _surgeryRepository.GetWithLinksAsync(request.SurgeryId, cancellationToken);
            if (surgery != null) request.Result = SurgeryCaseViewModel.FromCase(surgery, now);
        }

        private static string? Clean(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
