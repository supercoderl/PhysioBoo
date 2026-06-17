using MediatR;

namespace PhysioBoo.Application.Queries.Roles.GetPermissionsByRole
{
    public sealed record GetPermissionsByRoleQuery(Guid Id) : IRequest<IEnumerable<string>>;
}
