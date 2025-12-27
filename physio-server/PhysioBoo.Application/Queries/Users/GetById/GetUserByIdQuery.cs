using MediatR;
using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Queries.Users.GetById
{
    public sealed record GetUserByIdQuery(Guid Id) : IRequest<UserViewModel?>;
}
