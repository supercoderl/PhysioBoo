using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Roles.GetAll
{
    public sealed record GetAllRolesQuery(
        PagedRequest<RoleFilter> Request
    ) : IRequest<PagedResult<RoleViewModel>>;
}
