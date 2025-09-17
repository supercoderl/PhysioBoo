using MediatR;
using PhysioBoo.Application.ViewModels.VerificationTokens;

namespace PhysioBoo.Application.Queries.VerificationTokens.GetByToken
{
    public sealed record GetVerificationTokenByTokenQuery(string Token) : IRequest<VerificationTokenViewModel?>;
}
