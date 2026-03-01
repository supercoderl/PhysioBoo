using MediatR;
using PhysioBoo.Application.ViewModels.Departments;

namespace PhysioBoo.Application.Queries.Departments.GetById
{
    public sealed record GetDepartmentByIdQuery(Guid Id) : IRequest<DepartmentViewModel?>;
}
