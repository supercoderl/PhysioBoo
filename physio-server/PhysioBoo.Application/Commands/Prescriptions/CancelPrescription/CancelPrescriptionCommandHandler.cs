
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Prescriptions.CancelPrescription
{
    public sealed class CancelPrescriptionCommandHandler : CommandHandlerBase, IRequestHandler<CancelPrescriptionCommand>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public CancelPrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task Handle(CancelPrescriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Clinical.Prescription? prescription = await _prescriptionRepository.GetByIdAsync(request.PrescriptionId, ct: ct);

            if (prescription == null)
            {
                await NotifyAsync(new DomainNotification(nameof(CancelPrescriptionCommand),
                    $"Prescription with id {request.PrescriptionId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (prescription.Status == Domain.Enums.PrescriptionStatus.Draft || prescription.Status == Domain.Enums.PrescriptionStatus.Issued)
            {
                prescription.Cancel(request.Prescription.Reason);
                await _prescriptionRepository.UpdateTrackedAsync(prescription, ct);
            }
        }
    }
}