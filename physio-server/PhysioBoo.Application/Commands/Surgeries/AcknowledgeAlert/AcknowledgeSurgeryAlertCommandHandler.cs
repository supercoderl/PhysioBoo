using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.AcknowledgeAlert
{
    public sealed class AcknowledgeSurgeryAlertCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeSurgeryAlertCommand>
    {
        private readonly ISurgeryAlertRepository _alertRepository;
        private readonly IUser _user;

        public AcknowledgeSurgeryAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryAlertRepository alertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeSurgeryAlertCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _alertRepository.ExistsAsync(request.AlertId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Alert with id {request.AlertId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string? note = string.IsNullOrWhiteSpace(request.Input.Note) ? null : request.Input.Note.Trim();
            string? userName = _user.Name;
            Guid? userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? acknowledgedAt = now;
            DateTime? updatedAt = now;

            // Acknowledging twice is not an error: the first acknowledgement wins and the second does nothing.
            await _alertRepository.BatchUpdateMultipleAsync(
                a => a.Id == request.AlertId && !a.IsAcknowledged,
                s => s
                    .SetProperty(a => a.IsAcknowledged, true)
                    .SetProperty(a => a.AcknowledgedAt, acknowledgedAt)
                    .SetProperty(a => a.AcknowledgedByName, userName)
                    .SetProperty(a => a.AcknowledgeNote, note)
                    .SetProperty(a => a.UpdatedBy, userId)
                    .SetProperty(a => a.UpdatedAt, updatedAt),
                cancellationToken
            );
        }
    }
}
