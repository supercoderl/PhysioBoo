using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.UpdateTaskStatus
{
    public sealed class UpdateTaskStatusCommandHandler : CommandHandlerBase, IRequestHandler<UpdateTaskStatusCommand>
    {
        private readonly INursingTaskRepository _taskRepository;
        private readonly IUser _user;

        public UpdateTaskStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INursingTaskRepository taskRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _taskRepository = taskRepository;
            _user = user;
        }

        public async Task Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            NursingTask? task = await _taskRepository.GetByIdAsync(request.TaskId, ct: cancellationToken);
            if (task == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Task with id {request.TaskId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            NursingTaskStatus status = Enum.Parse<NursingTaskStatus>(request.Input.Status, true);
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? completedAt = status == NursingTaskStatus.Completed ? now : null;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = now;

            // Only a pending task can change, so two nurses cannot both complete it.
            int updated = await _taskRepository.BatchUpdateMultipleAsync(
                t => t.Id == request.TaskId && t.Status == NursingTaskStatus.Pending,
                s => s
                    .SetProperty(t => t.Status, status)
                    .SetProperty(t => t.CompletedAt, completedAt)
                    .SetProperty(t => t.UpdatedBy, userId)
                    .SetProperty(t => t.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This task is no longer pending.",
                    DomainErrorCodes.Nursing.TaskNotPending
                ));
                return;
            }

            task.SetStatus(status);
            task.SetCompletedAt(completedAt);
            request.Result = NursingTaskViewModel.FromEntity(task, now);
        }
    }
}
