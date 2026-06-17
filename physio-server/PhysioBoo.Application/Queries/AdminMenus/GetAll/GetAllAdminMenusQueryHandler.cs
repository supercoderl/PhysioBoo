using MediatR;
using Microsoft.EntityFrameworkCore;
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
            PagedResult<AdminMenu> rootsPage = await _adminMenuRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);

            List<AdminMenu> all = await _adminMenuRepository.GetAllNoTracking().ToListAsync(cancellationToken);
            ILookup<Guid?, AdminMenu> byParent = all.ToLookup(m => m.ParentId);

            // Map to view model
            AdminMenuViewModel Build(AdminMenu m) => new()
            {
                Id = m.Id,
                Label = m.Label,
                Icon = m.Icon,
                Route = m.Route,
                Order = m.Order,
                IsActive = m.IsActive,
                PermissionCode = m.PermissionCode,
                Children = byParent[m.Id]
                    .OrderBy(c => c.Order)
                    .Select(Build)
                    .ToList() is { Count: > 0 } kids ? kids : null
            };

            List<AdminMenuViewModel> items = rootsPage.Items.Select(Build).ToList();
            return new PagedResult<AdminMenuViewModel>(
                rootsPage.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
