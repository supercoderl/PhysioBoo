using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Roles.GetAll
{
    public sealed class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, PagedResult<RoleViewModel>>
    {
        private readonly IRoleRepository _roleRepository;

        public GetAllRolesQueryHandler(
            IRoleRepository roleRepository
        )
        {
            _roleRepository = roleRepository;
        }

        public async Task<PagedResult<RoleViewModel>> Handle(GetAllRolesQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<RoleFilter> req = q.Request;
            Expression<Func<Role, bool>>? predicate = null;

            if (req.Filter != null)
            {
                predicate = r =>
                    (!req.Filter.IsActive.HasValue || r.IsActive == req.Filter.IsActive.Value);
            }

            Func<IQueryable<Role>, IOrderedQueryable<Role>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                if (req.Sort.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderByDescending(u => u.CreatedAt);
            }

            PagedResult<Role> paged = await _roleRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<RoleViewModel> items = paged.Items.Select(r => RoleViewModel.FromRole(r)).ToList();
            return new PagedResult<RoleViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
