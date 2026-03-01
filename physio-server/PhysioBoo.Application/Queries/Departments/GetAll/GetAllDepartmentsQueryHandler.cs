using MediatR;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Departments.GetAll
{
    public sealed class GetAllDepartmentsQueryHandler : IRequestHandler<GetAllDepartmentsQuery, PagedResult<DepartmentViewModel>>
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ISortingExpressionProvider<DepartmentViewModel, Department> _sortingExpressionProvider;

        public GetAllDepartmentsQueryHandler(
            IDepartmentRepository departmentRepository,
            ISortingExpressionProvider<DepartmentViewModel, Department> sortingExpressionProvider
        )
        {
            _departmentRepository = departmentRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<DepartmentViewModel>> Handle(GetAllDepartmentsQuery q, CancellationToken cancellationToken)
        {
            DepartmentsSearchSpec spec = new DepartmentsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Department> paged = await _departmentRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<DepartmentViewModel> items = paged.Items.Select(d => DepartmentViewModel.FromDepartment(d)).ToList();
            return new PagedResult<DepartmentViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
