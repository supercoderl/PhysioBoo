using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.ScheduleMedication
{
    public sealed class ScheduleMedicationCommandHandler : CommandHandlerBase, IRequestHandler<ScheduleMedicationCommand>
    {
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public ScheduleMedicationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicationAdministrationRepository medicationRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicationRepository = medicationRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(ScheduleMedicationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _patientRepository.ExistsAsync(request.PatientId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            var input = request.Input;

            MedicationAdministration entry = new MedicationAdministration(
                Guid.NewGuid(),
                request.PatientId,
                input.MedicationName.Trim(),
                input.Dose.Trim(),
                input.Route.Trim(),
                input.Frequency.Trim(),
                input.ScheduledAt
            );
            entry.SetTenantId(_user.GetTenantId());
            entry.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _medicationRepository.InsertAsync<MedicationAdministration, Guid>(entry);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to schedule the dose: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = entry;
        }
    }
}
