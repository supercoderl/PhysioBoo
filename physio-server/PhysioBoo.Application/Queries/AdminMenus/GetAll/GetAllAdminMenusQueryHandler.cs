using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AdminMenus.GetAll
{
    public sealed class GetAllAdminMenusQueryHandler : IRequestHandler<GetAllAdminMenusQuery, PagedResult<AdminMenuViewModel>>
    {
        private readonly IAdminMenuRepository _adminMenuRepository;
        private readonly ISortingExpressionProvider<AdminMenuViewModel, AdminMenu> _sortingExpressionProvider;

        public GetAllAdminMenusQueryHandler(
            IAdminMenuRepository adminMenuRepository,
            ISortingExpressionProvider<AdminMenuViewModel, AdminMenu> sortingExpressionProvider
        )
        {
            _adminMenuRepository = adminMenuRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<AdminMenuViewModel>> Handle(GetAllAdminMenusQuery q, CancellationToken cancellationToken)
        {
            AdminMenusSearchSpec spec = new AdminMenusSearchSpec(q, _sortingExpressionProvider);

            PagedResult<AdminMenu> paged = await _adminMenuRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<AdminMenuViewModel> items = paged.Items.Select(am => AdminMenuViewModel.FromAdminMenu(am)).ToList();
            return new PagedResult<AdminMenuViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
