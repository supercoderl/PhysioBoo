using MediatR;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Queries.Users.GetByEmail
{
    public sealed record GetUserByEmailQuery(string Email) : IRequest<User?>;
}
