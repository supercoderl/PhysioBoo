using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Users.GetAll
{
    public sealed record GetAllUsersQuery(
        PagedRequest<UserFilter> Request
    ) : IRequest<PagedResult<UserViewModel>>;
}
