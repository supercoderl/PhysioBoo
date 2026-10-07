using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sessions.RevokeSession
{
    public sealed class RevokeSessionCommandValidation : AbstractValidator<RevokeSessionCommand>
    {
        public RevokeSessionCommandValidation()
        {
            RuleFor(c => c.SessionId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Session.EmptyId).WithMessage("Session id may not be empty.");
        }
    }
}
