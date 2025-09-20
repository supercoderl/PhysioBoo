using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.ResetPassword
{
    public sealed class ResetPasswordCommandHandler : CommandHandlerBase, IRequestHandler<ResetPasswordCommand>
    {
        private readonly IUserRepository _userRepository;

        public ResetPasswordCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
        }

        public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _userRepository.BatchUpdateAsync(
                predicate: u => u.Id == request.Id,
                updateDto: new { PasswordHash = AuthHelper.HashPassword(request.NewPassword) },
                cancellationToken
            );

            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Update user failed. Please try again.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            await Bus.RaiseEventAsync(new UserResetPasswordEvent(request.Id, request.Email));
        }
    }
}
