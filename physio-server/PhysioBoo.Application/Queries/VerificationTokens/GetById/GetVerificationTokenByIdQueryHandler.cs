using MediatR;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.VerificationTokens.GetById
{
    public sealed class GetVerificationTokenByIdQueryHandler : IRequestHandler<GetVerificationTokenByIdQuery, VerificationTokenViewModel?>
    {
        private readonly IVerificationTokenRepository _verificationTokenRepository;
        private readonly IMediatorHandler _bus;

        public GetVerificationTokenByIdQueryHandler(
            IVerificationTokenRepository verificationTokenRepository,
            IMediatorHandler bus
        )
        {
            _verificationTokenRepository = verificationTokenRepository;
            _bus = bus;
        }

        public async Task<VerificationTokenViewModel?> Handle(GetVerificationTokenByIdQuery request, CancellationToken cancellationToken)
        {
            var token = await _verificationTokenRepository.GetByIdCompiledAsync(request.Id);

            if (token is null)
            {
                await _bus.RaiseEventAsync(
                    new DomainNotification(
                        nameof(GetVerificationTokenByIdQuery),
                        $"Token with id {request.Id} could not be found",
                        ErrorCodes.ObjectNotFound));
                return null;
            }

            return VerificationTokenViewModel.FromVerificationToken(token);
        }
    }
}
