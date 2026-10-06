using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeHandover
{
    public sealed class AcknowledgeHandoverCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeHandoverCommand>
    {
        private readonly IHandoverCardRepository _handoverCardRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IUser _user;

        public AcknowledgeHandoverCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHandoverCardRepository handoverCardRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _handoverCardRepository = handoverCardRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeHandoverCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _handoverCardRepository.ExistsAsync(request.CardId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Handover card with id {request.CardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string acknowledgedBy = _user.Name;
            DateTime? acknowledgedAt = TimeZoneHelper.GetLocalTimeNow();

            // The first acknowledgement wins; a repeat changes nothing.
            await _handoverCardRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.CardId && !c.IsAcknowledged,
                s => s
                    .SetProperty(c => c.IsAcknowledged, true)
                    .SetProperty(c => c.AcknowledgedByName, acknowledgedBy)
                    .SetProperty(c => c.AcknowledgedAt, acknowledgedAt),
                cancellationToken
            );

            HandoverCard card = await _handoverCardRepository
                .GetAllNoTracking(c => c.Id == request.CardId, includeProperties: "Patient.Profile")
                .FirstAsync(cancellationToken);

            BedAssignment? stay = await _bedAssignmentRepository
                .GetAllNoTracking(a => a.AdmissionId == card.AdmissionId && a.DischargedAt == null, includeProperties: "Bed")
                .FirstOrDefaultAsync(cancellationToken);

            request.Result = ShiftHandoverCardViewModel.FromEntity(card, stay?.Bed?.Number);
        }
    }
}
