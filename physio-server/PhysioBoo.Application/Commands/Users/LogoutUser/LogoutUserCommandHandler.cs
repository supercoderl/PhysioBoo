using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.LogoutUser
{
    public sealed class LogoutUserCommandHandler : CommandHandlerBase, IRequestHandler<LogoutUserCommand>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUser _user;

        public LogoutUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRefreshTokenRepository refreshTokenRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _user = user;
        }

        public async Task Handle(LogoutUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Guid userId;

            try
            {
                userId = _user.GetUserId();
            }
            catch (Exception)
            {
                return;
            }

            // Revoke logic command
            int result = await _refreshTokenRepository.BatchUpdateMultipleAsync(
                predicate: rt => rt.UserId == userId && rt.ExpiresAt > TimeZoneHelper.GetLocalTimeNow(),
                setterExpression: setters => setters.SetProperty(rt => rt.ExpiresAt, _ => TimeZoneHelper.GetLocalTimeNow()),
                cancellationToken: cancellationToken
            );

            if (result > 0)
            {
                await Bus.RaiseEventAsync(new UserLoggedOutEvent(userId));
            }
        }
    }
}
