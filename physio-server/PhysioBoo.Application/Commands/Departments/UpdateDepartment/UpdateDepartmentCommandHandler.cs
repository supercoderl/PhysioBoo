using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Departments.UpdateDepartment
{
    public sealed class UpdateDepartmentCommandHandler : CommandHandlerBase, IRequestHandler<UpdateDepartmentCommand>
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUser _user;

        public UpdateDepartmentCommandHandler(
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

        public async Task Handle(UpdateDepartmentCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.Department? department = await _departmentRepository.GetByIdAsync(request.Department.Id);

            if (department == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Department with Id {request.Department.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            department.SetHospitalId(request.Department.HospitalId);
            department.SetName(request.Department.Name);
            department.SetDescription(request.Department.Description);
            department.SetHeadOfDepartment(request.Department.HeadOfDepartment);
            department.SetFloorNumber(request.Department.FloorNumber);
            department.SetWing(request.Department.Wing);
            department.SetPhone(request.Department.Phone);
            department.SetEmail(request.Department.Email);
            department.SetBudgetAllocated(request.Department.BudgetAllocated);
            department.SetBedCount(request.Department.BedCount);
            department.SetIsEmergency(request.Department.IsEmergency);
            department.SetIsCriticalCare(request.Department.IsCriticalCare);
            department.SetIsOutPatient(request.Department.IsOutPatient);
            department.SetIsInPatient(request.Department.IsInPatient);
            department.SetOperationHours(request.Department.OperationHours);
            department.SetEquipmentList(request.Department.EquipmentList);
            department.SetIsActive(request.Department.IsActive);
            department.SetUpdatedBy(_user.GetUserId());

            await _departmentRepository.UpdateTrackedAsync(department, ct);
        }
    }
}