using MediatR;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.ChangePasswordUser
{
    public sealed class ChangePasswordUserCommandHandler : CommandHandlerBase, IRequestHandler<ChangePasswordUserCommand>
    {
        private readonly IUserRepository _userRepository;

        public ChangePasswordUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
        }

        public async Task Handle(ChangePasswordUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var user = await Bus.QueryAsync(new GetUserByIdQuery(request.Id));

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User {request.Id} does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            if (!await ValidatePassword(user, request)) return;

            user.SetPassword(AuthHelper.HashPassword(request.NewPassword));

            var result = await _userRepository.UpdateTrackedAsync(user);

            if (!await CheckStatus(result, request)) return;

            await Bus.SendCommandAsync(new LogoutUserCommand(request.Id));
        }

        /// <summary>
        /// Validates the user's password. 
        /// If incorrect, a domain notification is published and the method returns <c>false</c>.
        /// </summary>
        /// <param name="user">The user being validated.</param>
        /// <param name="request">The change password request containing the raw password.</param>
        /// <returns><c>true</c> if the password is valid; otherwise, <c>false</c>.</returns>
        private async Task<bool> ValidatePassword(Domain.Entities.Core.User user, ChangePasswordUserCommand request)
        {
            if (!AuthHelper.VerifyPassword(request.OldPassword, user.PasswordHash))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Old password does not correct!",
                    "WRONG_PASSWORD"
                ));

                return false;
            }

            return true;
        }

        /// <summary>
        /// Check status from updating
        /// If failed, a domain notification is published and the method returns <c>false</c>.
        /// </summary>
        /// <param name="result">The result after updated.</param>
        /// <param name="request">The change password request containing the raw password.</param>
        /// <returns><c>true</c> if the password is valid; otherwise, <c>false</c>.</returns>
        private async Task<bool> CheckStatus(int result, ChangePasswordUserCommand request)
        {
            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Update new password failed, please try again.",
                    ErrorCodes.CommitFailed
                ));
                return false;

            }
            return true;
        }
    }
}
