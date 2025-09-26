using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Prescriptions.CreatePrescription
{
    public sealed class CreatePrescriptionCommandHandler : CommandHandlerBase, IRequestHandler<CreatePrescriptionCommand>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public CreatePrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task Handle(CreatePrescriptionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _prescriptionRepository.InsertAsync<Prescription, Guid>(new Prescription(
                request.NewPrescription.Id,
                request.NewPrescription.PrescriptionNumber,
                request.NewPrescription.PatientId,
                request.NewPrescription.DoctorId,
                request.NewPrescription.AppoinmentId,
                request.NewPrescription.MedicalRecordId,
                request.NewPrescription.HospitalId,
                request.NewPrescription.Diagnosis,
                request.NewPrescription.Instructions,
                request.NewPrescription.TotalAmount,
                request.NewPrescription.ValidUntil,
                request.NewPrescription.PharmacistNotes
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
