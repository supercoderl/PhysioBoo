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

        public async Task<UserViewModel?> Handle(GetUserByIdQuery request, CancellationToken ct)
        {
            User? user = await _userRepository.GetByIdAsync(
                request.Id,
                includeProperties: "Doctor,Patient,Profile"
            );

            if (user is null) return null;

            return UserViewModel.FromUser(user);
        }
    }
}
