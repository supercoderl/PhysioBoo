using MediatR;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Permissions.GetAll
{
    public sealed record GetAllPermissionsQuery(
        PagedRequest<PermissionFilter> Request
    ) : IRequest<PagedResult<PermissionViewModel>>;
}
