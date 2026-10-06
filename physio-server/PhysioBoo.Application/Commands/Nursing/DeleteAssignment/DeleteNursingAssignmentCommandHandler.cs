using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.DeleteAssignment
{
    public sealed class DeleteNursingAssignmentCommandHandler : CommandHandlerBase, IRequestHandler<DeleteNursingAssignmentCommand>
    {
        private readonly INursingAssignmentRepository _assignmentRepository;

        public DeleteNursingAssignmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            INursingAssignmentRepository assignmentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _assignmentRepository = assignmentRepository;
        }

        public async Task Handle(DeleteNursingAssignmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            NursingAssignment? assignment = await _assignmentRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (assignment == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Assignment with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _assignmentRepository.SoftDeleteSingle(assignment, false, cancellationToken);

            await CommitAsync();
        }
    }
}
