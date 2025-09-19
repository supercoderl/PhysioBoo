using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetById
{
    public sealed class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, User?>
    {
        private readonly IUserRepository _userRepository;
        private readonly IMediatorHandler _bus;

        public GetUserByIdQueryHandler(
            IUserRepository userRepository,
            IMediatorHandler bus
        )
        {
            _userRepository = userRepository;
            _bus = bus;
        }

        public async Task<User?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdCompiledAsync(request.Id);

            return user;
        }
    }
}
