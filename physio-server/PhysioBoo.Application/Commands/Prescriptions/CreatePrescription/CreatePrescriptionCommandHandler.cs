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
        private readonly IUser _user;

        public CreatePrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
            _user = user;
        }

        public async Task Handle(CreatePrescriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Prescription newPrescription = new Prescription(
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
            );

            newPrescription.SetTenantId(_user.GetTenantId());
            newPrescription.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _prescriptionRepository.InsertAsync<Prescription, Guid>(newPrescription);

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
