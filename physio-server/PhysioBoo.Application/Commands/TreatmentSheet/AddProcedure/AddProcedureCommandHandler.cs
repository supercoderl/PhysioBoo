using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProcedure
{
    public sealed class AddProcedureCommandHandler : CommandHandlerBase, IRequestHandler<AddProcedureCommand>
    {
        private readonly ITreatmentProcedureRepository _procedureRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public AddProcedureCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITreatmentProcedureRepository procedureRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _procedureRepository = procedureRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(AddProcedureCommand request, CancellationToken cancellationToken)
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

            TreatmentProcedure procedure = new TreatmentProcedure(
                Guid.NewGuid(),
                request.PatientId,
                input.Name.Trim(),
                Enum.Parse<TreatmentProcedureStatus>(input.Status, true),
                input.Department.Trim(),
                input.ScheduledTime,
                input.CompletionTime,
                string.IsNullOrWhiteSpace(input.PerformerName) ? null : input.PerformerName.Trim()
            );
            procedure.SetTenantId(_user.GetTenantId());
            procedure.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _procedureRepository.InsertAsync<TreatmentProcedure, Guid>(procedure);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to record the procedure: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = TreatmentProcedureRowViewModel.FromEntity(procedure);
        }
    }
}
