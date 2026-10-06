using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.AddIntakeOutput
{
    public sealed class AddIntakeOutputCommandHandler : CommandHandlerBase, IRequestHandler<AddIntakeOutputCommand>
    {
        private readonly IIntakeOutputEntryRepository _intakeOutputRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public AddIntakeOutputCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IIntakeOutputEntryRepository intakeOutputRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _intakeOutputRepository = intakeOutputRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(AddIntakeOutputCommand request, CancellationToken cancellationToken)
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

            IntakeOutputEntry entry = new IntakeOutputEntry(
                Guid.NewGuid(),
                request.PatientId,
                input.RecordedAt ?? TimeZoneHelper.GetLocalTimeNow(),
                _user.Name,
                Enum.Parse<IntakeOutputDirection>(input.Direction, true),
                Enum.Parse<IntakeOutputCategory>(input.Category, true),
                input.VolumeMl,
                string.IsNullOrWhiteSpace(input.Notes) ? null : input.Notes.Trim()
            );
            entry.SetTenantId(_user.GetTenantId());
            entry.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _intakeOutputRepository.InsertAsync<IntakeOutputEntry, Guid>(entry);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to record the entry: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = IntakeOutputEntryViewModel.FromEntity(entry);
        }
    }
}
