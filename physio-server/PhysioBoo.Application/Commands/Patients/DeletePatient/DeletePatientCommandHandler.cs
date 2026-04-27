using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Patients.DeletePatient
{
    public sealed class DeletePatientCommandHandler : CommandHandlerBase, IRequestHandler<DeletePatientCommand>
    {
        private readonly IPatientRepository _patientRepository;

        public DeletePatientCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
        }

        public async Task Handle(DeletePatientCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.PatientInformation.Patient? patient = await _patientRepository.GetByIdAsync(request.Id);

            if (patient == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Patient not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _patientRepository.SoftDeleteSingle(
                patient,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}