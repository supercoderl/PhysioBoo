using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.AdminMenus.GetAll
{
    public sealed class GetAllAdminMenusQueryHandler : IRequestHandler<GetAllAdminMenusQuery, PagedResult<AdminMenuViewModel>>
    {
        private readonly IAdminMenuRepository _adminMenuRepository;

        public GetAllAdminMenusQueryHandler(
            IAdminMenuRepository adminMenuRepository
        )
        {
            _adminMenuRepository = adminMenuRepository;
        }

        public async Task<PagedResult<AdminMenuViewModel>> Handle(GetAllAdminMenusQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<AdminMenuFilter> req = q.Request;
            Expression<Func<AdminMenu, bool>>? predicate = r => r.ParentId == null;

            if (req.Filter != null)
            {
                predicate = r =>
                    (!req.Filter.IsActive.HasValue || r.IsActive == req.Filter.IsActive.Value);
            }

            Func<IQueryable<AdminMenu>, IOrderedQueryable<AdminMenu>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                if (req.Sort.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderByDescending(u => u.CreatedAt);
            }

            PagedResult<AdminMenu> paged = await _adminMenuRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                includeProperties: "SubMenus",
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<AdminMenuViewModel> items = paged.Items.Select(am => AdminMenuViewModel.FromAdminMenu(am)).ToList();
            return new PagedResult<AdminMenuViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
