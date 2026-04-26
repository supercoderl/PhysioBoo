using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Departments.DeleteDepartment
{
    public sealed class DeleteDepartmentCommandHandler : CommandHandlerBase, IRequestHandler<DeleteDepartmentCommand>
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DeleteDepartmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDepartmentRepository departmentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.Department? department = await _departmentRepository.GetByIdAsync(request.Id);

            if (department == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Department not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _departmentRepository.SoftDeleteSingle(
                department,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}