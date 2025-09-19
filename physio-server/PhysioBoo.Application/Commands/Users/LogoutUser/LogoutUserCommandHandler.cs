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

        public LogoutUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRefreshTokenRepository refreshTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task Handle(LogoutUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // Revoke logic command
            var result = await _refreshTokenRepository.BatchUpdateMultipleAsync(
                predicate: rt => rt.UserId == request.UserId && rt.ExpiresAt > TimeZoneHelper.GetLocalTimeNow(),
                setterExpression: setters => setters.SetProperty(rt => rt.ExpiresAt, _ => TimeZoneHelper.GetLocalTimeNow()),
                cancellationToken: cancellationToken
            );

            if (result > 0)
            {
                await Bus.RaiseEventAsync(new UserLoggedOutEvent(request.UserId));
            }
        }
    }
}
