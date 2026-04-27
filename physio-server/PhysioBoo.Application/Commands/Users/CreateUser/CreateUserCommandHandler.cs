using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
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

            User newUser = new User(
                request.NewId,
                request.NewUser.Email,
                request.NewUser.Phone,
                AuthHelper.HashPassword(request.NewUser.Password)
            );

            newUser.SetTenantId(_user.GetTenantId());
            newUser.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _userRepository.InsertAsync<User, Guid>(newUser);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new UsersCreatedEvent(
                result.Id,
                VerificationType.Email.ToString()
            ));
        }
    }
}
