using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

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
            var user = await _userRepository.GetByIdCompiledAsync(request.Id);

            if (user is null)
            {
                await _bus.RaiseEventAsync(
                    new DomainNotification(
                        nameof(GetUserByIdQuery),
                        $"User with id {request.Id} could not be found",
                        ErrorCodes.ObjectNotFound));
                return null;
            }

            return UserViewModel.FromUser(user);
        }
    }
}
