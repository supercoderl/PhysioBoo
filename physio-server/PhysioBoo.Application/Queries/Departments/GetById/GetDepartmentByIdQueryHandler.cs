using MediatR;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Departments.GetById
{
    public sealed class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, DepartmentViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IDepartmentRepository _departmentRepository;

        public GetDepartmentByIdQueryHandler(
            IMediatorHandler bus,
            IDepartmentRepository departmentRepository
        )
        {
            _bus = bus;
            _departmentRepository = departmentRepository;
        }

        public async Task<DepartmentViewModel?> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
        {
            Department? department = await _departmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (department == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetDepartmentByIdQuery),
                    $"Medical specialty with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return DepartmentViewModel.FromDepartment(department);
        }
    }
}
