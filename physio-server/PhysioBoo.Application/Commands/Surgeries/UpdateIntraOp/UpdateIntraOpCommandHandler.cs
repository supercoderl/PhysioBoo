using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateIntraOp
{
    public sealed class UpdateIntraOpCommandHandler : CommandHandlerBase, IRequestHandler<UpdateIntraOpCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IUser _user;

        public UpdateIntraOpCommandHandler(
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

        public async Task Handle(UpdateIntraOpCommand request, CancellationToken cancellationToken)
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
            string? notes = Clean(request.Input.Notes);
            string? complications = Clean(request.Input.Complications);
            int? bloodLossMl = request.Input.BloodLossMl;
            int? remainingMinutes = request.Input.EstimatedRemainingMinutes;
            Guid? userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? updatedAt = now;

            // Intra-operative data is only recorded while the patient is under anaesthesia or in the operation.
            int updated = await _surgeryRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.SurgeryId
                    && (c.Status == SurgeryStatus.AnesthesiaStarted || c.Status == SurgeryStatus.InProgress),
                s => s
                    .SetProperty(c => c.Notes, c => notes ?? c.Notes)
                    .SetProperty(c => c.Complications, c => complications ?? c.Complications)
                    .SetProperty(c => c.BloodLossMl, c => bloodLossMl ?? c.BloodLossMl)
                    .SetProperty(c => c.EstimatedRemainingMinutes, c => remainingMinutes ?? c.EstimatedRemainingMinutes)
                    .SetProperty(c => c.UpdatedBy, userId)
                    .SetProperty(c => c.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Intra-operative data can only be recorded while the operation is under way.",
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
