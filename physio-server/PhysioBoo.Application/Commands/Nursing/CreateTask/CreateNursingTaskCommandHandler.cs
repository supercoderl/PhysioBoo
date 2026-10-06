using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.CreateTask
{
    public sealed class CreateNursingTaskCommandHandler : CommandHandlerBase, IRequestHandler<CreateNursingTaskCommand>
    {
        private readonly INursingTaskRepository _taskRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public CreateNursingTaskCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INursingTaskRepository taskRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _taskRepository = taskRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(CreateNursingTaskCommand request, CancellationToken cancellationToken)
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

            NursingTask task = new NursingTask(
                Guid.NewGuid(),
                request.PatientId,
                request.Input.Label.Trim(),
                request.Input.DueAt,
                string.IsNullOrWhiteSpace(request.Input.AssignedNurseName) ? _user.Name : request.Input.AssignedNurseName.Trim()
            );
            task.SetTenantId(_user.GetTenantId());
            task.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _taskRepository.InsertAsync<NursingTask, Guid>(task);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create the task: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = NursingTaskViewModel.FromEntity(task, TimeZoneHelper.GetLocalTimeNow());
        }
    }
}
