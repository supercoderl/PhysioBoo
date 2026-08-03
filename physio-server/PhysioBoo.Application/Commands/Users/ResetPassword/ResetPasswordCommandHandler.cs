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
        private readonly IVerificationTokenRepository _verificationTokenRepository;
        private readonly IUserRepository _userRepository;

        public ResetPasswordCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationTokenRepository verificationTokenRepository,
            IUserRepository userRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationTokenRepository = verificationTokenRepository;
            _userRepository = userRepository;
        }

        public async Task Handle(ResetPasswordCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid userId = await _verificationTokenRepository.GetUserIdByTokenAsync(request.Token);

            if (userId == Guid.Empty)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Token does not exist",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            int result = await _userRepository.BatchUpdateAsync(
                predicate: u => u.Id == userId,
                updateDto: new { PasswordHash = AuthHelper.HashPassword(request.NewPassword) },
                ct
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

            await Bus.RaiseEventAsync(new UserResetPasswordEvent(userId, request.Token));
        }
    }
}
