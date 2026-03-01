using MediatR;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Departments.GetAll
{
    public sealed record GetAllDepartmentsQuery(
        PagedRequest<DepartmentFilter> Request
    ) : IRequest<PagedResult<DepartmentViewModel>>;
}
