using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetProfile
{
    public sealed class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileViewModel?>
    {
        private readonly IUserRepository _userRepository;
        private readonly IMediatorHandler _bus;
        private readonly IUser _user;

        public GetUserProfileQueryHandler(
            IUserRepository userRepository,
            IMediatorHandler bus,
            IUser user
        )
        {
            _userRepository = userRepository;
            _bus = bus;
            _user = user;
        }

        public async Task<UserProfileViewModel?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            User? user = await _userRepository.GetByIdAsync(
                _user.GetUserId(),
                includeProperties: "Doctor,Patient,Profile,UserRoles,UserRoles.Role"
            );

            if (user is null) return null;

            return UserProfileViewModel.FromUser(user);
        }
    }
}
