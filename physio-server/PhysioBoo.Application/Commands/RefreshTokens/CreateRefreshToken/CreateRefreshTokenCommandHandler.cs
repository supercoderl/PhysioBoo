using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.RefreshTokens;

namespace PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken
{
    public sealed class CreateRefreshTokenCommandHandler : CommandHandlerBase, IRequestHandler<CreateRefreshTokenCommand>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public CreateRefreshTokenCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRefreshTokenRepository refreshTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task Handle(CreateRefreshTokenCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            await _refreshTokenRepository.AddRangeAsync(request.NewRefreshTokens.Select(
                refreshTokenDto => new Domain.Entities.Core.RefreshToken(
                    refreshTokenDto.Id,
                    refreshTokenDto.UserId,
                    refreshTokenDto.Token,
                    refreshTokenDto.ExpiresAt
                ))
            );

            if (await CommitAsync())
            {
                var userIds = request.NewRefreshTokens.Select(rt => rt.Id).ToList();
                await Bus.RaiseEventAsync(new RefreshTokenCreatedEvent(userIds));
            }
        }
    }
}
