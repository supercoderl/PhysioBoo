using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.UpdateHandover
{
    /// <summary>Edits a handover card's SBAR text. Once the incoming nurse has acknowledged it, the card is locked.</summary>
    public sealed class UpdateHandoverCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHandoverCommand>
    {
        private readonly IHandoverCardRepository _handoverCardRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IUser _user;

        public UpdateHandoverCommandHandler(
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

        public async Task Handle(UpdateHandoverCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HandoverCard? card = await _handoverCardRepository
                .GetAll(c => c.Id == request.CardId, includeProperties: "Patient.Profile").AsTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (card == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Handover card with id {request.CardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (card.IsAcknowledged)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This handover was already acknowledged and can no longer be edited.",
                    DomainErrorCodes.Nursing.HandoverAlreadyAcknowledged
                ));
                return;
            }

            UpdateHandoverViewModel sbar = request.Sbar;
            if (sbar.Situation != null) card.SetSituation(sbar.Situation.Trim());
            if (sbar.Background != null) card.SetBackground(sbar.Background.Trim());
            if (sbar.Assessment != null) card.SetAssessment(sbar.Assessment.Trim());
            if (sbar.Recommendation != null) card.SetRecommendation(sbar.Recommendation.Trim());
            card.SetUpdatedBy(_user.GetUserId());

            if (!await CommitAsync()) return;

            BedAssignment? stay = await _bedAssignmentRepository
                .GetAllNoTracking(a => a.AdmissionId == card.AdmissionId && a.DischargedAt == null, includeProperties: "Bed")
                .FirstOrDefaultAsync(cancellationToken);

            request.Result = ShiftHandoverCardViewModel.FromEntity(card, stay?.Bed?.Number);
        }
    }
}
