using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKenel.Utils;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandHandler : CommandHandlerBase, IRequestHandler<GenerateEmailVerificationTokenCommand>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;

        public GenerateEmailVerificationTokenCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVerificationTokenRepository verificationTokenRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _verificationTokenRepository = verificationTokenRepository;
        }

        public async Task Handle(GenerateEmailVerificationTokenCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var newToken = TokenHelper.GenerateTimestampedToken(24);

            await _verificationTokenRepository.AddRangeAsync(
                request.NewListVerificationTokens.Select(
                    newToken => new Domain.Entities.Core.VerificationToken(
                        newToken.Id, 
                        newToken.UserId, 
                        newToken.Token,
                        newToken.ExpiresAt, 
                        newToken.Type
                    )
                )
            );

            if (await CommitAsync())
            {
                foreach (var tokenRequest in request.NewListVerificationTokens)
                {
                    await Bus.RaiseEventAsync(new EmailVerificationTokenGeneratedEvent(
                        tokenRequest.UserId,
                        tokenRequest.Token,
                        tokenRequest.ExpiresAt
                    ));
                }
            }
        }
    }
}
