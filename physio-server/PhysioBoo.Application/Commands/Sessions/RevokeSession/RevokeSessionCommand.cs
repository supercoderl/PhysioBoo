namespace PhysioBoo.Application.Commands.Sessions.RevokeSession
{
    public sealed class RevokeSessionCommand : CommandBase, IRequest
    {
        private static readonly RevokeSessionCommandValidation s_validation = new();

        public Guid SessionId { get; }

        public RevokeSessionCommand(Guid sessionId) : base(Guid.NewGuid())
        {
            SessionId = sessionId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
