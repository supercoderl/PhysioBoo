using MediatR;
using PhysioBoo.Application.ViewModels.VerificationTokens;

namespace PhysioBoo.Application.Queries.VerificationTokens.GetById
{
    public sealed record GetVerificationTokenByIdQuery(Guid Id) : IRequest<VerificationTokenViewModel>;
}
