using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.AssignPatient
{
    public sealed class AssignPatientCommandHandler : CommandHandlerBase, IRequestHandler<AssignPatientCommand>
    {
        private readonly IBedRepository _bedRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public AssignPatientCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBedRepository bedRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _bedRepository = bedRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(AssignPatientCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _patientRepository.ExistsAsync(request.Input.PatientId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {request.Input.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // The repository claims the bed atomically, so it also reports "not found" and "not available".
            SharedKernel.Results.DbResult<Guid> result = await _bedRepository.AssignPatientAsync(
                request.BedId,
                request.Input.PatientId,
                null,
                request.Input.ExpectedDischargeDate,
                string.IsNullOrWhiteSpace(request.Input.Notes) ? null : request.Input.Notes.Trim(),
                _user.Name,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    BedOperationErrors.Describe(result.Error),
                    result.Error ?? ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
