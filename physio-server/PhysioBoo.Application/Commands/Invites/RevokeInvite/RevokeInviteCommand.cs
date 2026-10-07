namespace PhysioBoo.Application.Commands.Invites.RevokeInvite
{
    public sealed class RevokeInviteCommand : CommandBase, IRequest
    {
        private static readonly RevokeInviteCommandValidation s_validation = new();

        public Guid Id { get; }

        public RevokeInviteCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
