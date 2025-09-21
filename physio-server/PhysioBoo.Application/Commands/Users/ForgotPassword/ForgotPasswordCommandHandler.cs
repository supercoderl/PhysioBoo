using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Users.ForgotPassword
{
    public sealed class ForgotPasswordCommandHandler : CommandHandlerBase, IRequestHandler<ForgotPasswordCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IVerificationService _verificationService;

        public ForgotPasswordCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IVerificationService verificationService
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _verificationService = verificationService;
        }

        public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var user = await RetriveUserData(request);

            if (user == null) return;

            await _verificationService.SendAsync(user.Id, request.Email, VerificationType.PasswordReset, cancellationToken);
        }

        private async Task<User?> RetriveUserData(ForgotPasswordCommand request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User with email {request.Email} does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return user;
        }
    }
}
