using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Users.DeleteUser
{
    public sealed class DeleteUserCommandHandler : CommandHandlerBase, IRequestHandler<DeleteUserCommand>
    {
        private readonly IUserRepository _userRepository;

        public DeleteUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
        }

        public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.User? user = await _userRepository.GetByIdAsync(request.Id);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "User not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _userRepository.SoftDeleteSingle(
                user,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}