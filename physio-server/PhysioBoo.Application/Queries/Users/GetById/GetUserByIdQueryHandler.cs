using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetById
{
    public sealed class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserViewModel?>
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

        public async Task<UserViewModel?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            User? user = await _userRepository.GetByIdCompiledAsync(request.Id);

            if (user is null) return null;

            return UserViewModel.FromUser(user);
        }
    }
}
