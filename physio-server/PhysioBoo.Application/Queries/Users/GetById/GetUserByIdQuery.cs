using MediatR;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Queries.Users.GetById
{
    public sealed record GetUserByIdQuery(Guid Id) : IRequest<User?>;
}
