using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Prescriptions.IssuePrescription
{
    public sealed class IssuePrescriptionCommandHandler : CommandHandlerBase, IRequestHandler<IssuePrescriptionCommand>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public IssuePrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task Handle(IssuePrescriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Prescription? prescription = await _prescriptionRepository.GetByIdAsync(request.PrescriptionId, includeProperties: "PrescriptionItems.PrescriptionClinicalWarnings", ct);

            if (prescription == null)
            {
                await NotifyAsync(new DomainNotification(nameof(IssuePrescriptionCommand),
                    $"Prescription with id {request.PrescriptionId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (prescription.Status != PrescriptionStatus.Draft)
            {
                await NotifyAsync(new DomainNotification(nameof(IssuePrescriptionCommand),
                    $"Prescription with id {request.PrescriptionId} is not in Draft status and cannot be issued.", ErrorCodes.InvalidOperation));
                return;
            }

            if (prescription.PrescriptionItems.Count == 0)
            {
                await NotifyAsync(new DomainNotification(nameof(IssuePrescriptionCommand),
                    $"Prescription with id {request.PrescriptionId} has no items.", ErrorCodes.InvalidOperation));
                return;
            }

            bool hasUnacknowledgedCriticalWarning = prescription.PrescriptionItems
                .SelectMany(pi => pi.PrescriptionClinicalWarnings)
                .Any(w => w.Severity == Domain.Enums.Severity.Critical && w.AcknowledgedAt == null);

            if (hasUnacknowledgedCriticalWarning)
            {
                await NotifyAsync(new DomainNotification(nameof(IssuePrescriptionCommand),
                    $"Prescription with id {request.PrescriptionId} has unacknowledged critical clinical warnings.", ErrorCodes.InvalidOperation));
                return;
            }

            prescription.Issue();
            await _prescriptionRepository.UpdateTrackedAsync(prescription, ct);
        }
    }
}
