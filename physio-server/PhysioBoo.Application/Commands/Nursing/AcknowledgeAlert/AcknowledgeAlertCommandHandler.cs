using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeAlert
{
    public sealed class AcknowledgeAlertCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeAlertCommand>
    {
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IUser _user;

        public AcknowledgeAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IClinicalAlertRepository alertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeAlertCommand request, CancellationToken cancellationToken)
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
            string acknowledgedBy = _user.Name;
            DateTime? acknowledgedAt = TimeZoneHelper.GetLocalTimeNow();

            // Acknowledging twice is harmless: the first acknowledgement wins and the second changes nothing.
            await _alertRepository.BatchUpdateMultipleAsync(
                a => a.Id == request.AlertId && !a.IsAcknowledged,
                s => s
                    .SetProperty(a => a.IsAcknowledged, true)
                    .SetProperty(a => a.AcknowledgedAt, acknowledgedAt)
                    .SetProperty(a => a.AcknowledgedByName, acknowledgedBy)
                    .SetProperty(a => a.AcknowledgeNote, note),
                cancellationToken
            );
        }
    }
}
