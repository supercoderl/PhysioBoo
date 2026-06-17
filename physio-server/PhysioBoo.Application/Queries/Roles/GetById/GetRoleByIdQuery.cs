using MediatR;
using PhysioBoo.Application.ViewModels.Roles;

namespace PhysioBoo.Application.Queries.Roles.GetById
{
    public sealed record GetRoleByIdQuery(Guid Id) : IRequest<RoleViewModel?>;
}
