using MediatR;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Permissions.GetAll
{
    public sealed class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, PagedResult<PermissionViewModel>>
    {
        private readonly IPermissionRepository _permissionRepository;

        public GetAllPermissionsQueryHandler(
            IPermissionRepository permissionRepository
        )
        {
            _permissionRepository = permissionRepository;
        }

        public async Task<PagedResult<PermissionViewModel>> Handle(GetAllPermissionsQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<PermissionFilter> req = q.Request;
            Expression<Func<Permission, bool>>? predicate = null;

            if (req.Filter != null)
            {

            }

            Func<IQueryable<Permission>, IOrderedQueryable<Permission>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {

            }

            PagedResult<Permission> paged = await _permissionRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<PermissionViewModel> items = paged.Items.Select(r => PermissionViewModel.FromPermission(r)).ToList();
            return new PagedResult<PermissionViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
