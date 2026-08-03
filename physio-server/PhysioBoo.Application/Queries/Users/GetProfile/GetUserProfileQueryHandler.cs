using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetProfile
{
    public sealed class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileSummaryViewModel?>
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

        public async Task<UserProfileSummaryViewModel?> Handle(GetUserProfileQuery request, CancellationToken ct)
        {
            User? user = await _userRepository.GetByIdAsync(
                _user.GetUserId(),
                includeProperties: "Profile,UserRoles,UserRoles.Role,UserRoles.Role.RolePermissions.Permission"
            );

            if (user is null) return null;

            return UserProfileSummaryViewModel.FromEntity(user);
        }
    }
}
