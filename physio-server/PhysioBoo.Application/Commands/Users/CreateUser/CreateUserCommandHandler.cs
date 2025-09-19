using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommandHandler : CommandHandlerBase, IRequestHandler<CreateUserCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public CreateUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _user = user;
        }

        public async Task Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            await _userRepository.AddRangeAsync(request.NewListUsers.Select(
                userDTO => new Domain.Entities.Core.User(
                    userDTO.Id,
                    userDTO.Email,
                    userDTO.Phone,
                    AuthHelper.HashPassword(userDTO.Password),
                    userDTO.Role,
                    _user.GetUserId() == Guid.Empty ? userDTO.Id : _user.GetUserId()
                ))
            );

            if (await CommitAsync())
            {
                var userIds = request.NewListUsers.Select(u => u.Id).ToList();
                await Bus.RaiseEventAsync(new UsersCreatedEvent(userIds));
            }
        }
    }
}
