using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetMyAccount
{
    public sealed class GetMyAccountQueryHandler : IRequestHandler<GetMyAccountQuery, MyAccountViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public GetMyAccountQueryHandler(IMediatorHandler bus, IUserRepository userRepository, IUser user)
        {
            _bus = bus;
            _userRepository = userRepository;
            _user = user;
        }

        public async Task<MyAccountViewModel?> Handle(GetMyAccountQuery request, CancellationToken ct)
        {
            Guid userId = _user.GetUserId();
            User? user = await _userRepository.GetAllNoTracking(u => u.Id == userId, includeProperties: "Profile").FirstOrDefaultAsync(ct);

            if (user == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(nameof(GetMyAccountQuery), "User doesn't exist.", ErrorCodes.ObjectNotFound));
                return null;
            }

            return MyAccountViewModel.FromUser(user);
        }
    }
}
