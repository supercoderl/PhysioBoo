using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
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

            var result = await _refreshTokenRepository.InsertAsync<RefreshToken, Guid>(new RefreshToken(
                request.NewRefreshToken.Id,
                request.NewRefreshToken.UserId,
                request.NewRefreshToken.Token,
                request.NewRefreshToken.ExpiresAt
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new RefreshTokenCreatedEvent(result.Id));
        }
    }
}
