using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Departments.CreateDepartment
{
    public sealed class CreateDepartmentCommandHandler : CommandHandlerBase, IRequestHandler<CreateDepartmentCommand>
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUser _user;

        public CreateDepartmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDepartmentRepository departmentRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _departmentRepository = departmentRepository;
            _user = user;
        }

        public async Task Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Department newDepartment = new Department(
                request.NewDepartment.Id,
                request.NewDepartment.HospitalId,
                request.NewDepartment.Name,
                request.NewDepartment.DepartmentCode,
                request.NewDepartment.Description,
                request.NewDepartment.HeadOfDepartment,
                request.NewDepartment.FloorNumber,
                request.NewDepartment.Wing,
                request.NewDepartment.Phone,
                request.NewDepartment.Email,
                request.NewDepartment.BudgetAllocated,
                request.NewDepartment.OperationHours,
                request.NewDepartment.EquipmentList
            );

            newDepartment.SetTenantId(_user.GetTenantId());
            newDepartment.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _departmentRepository.InsertAsync<Department, Guid>(newDepartment);

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
