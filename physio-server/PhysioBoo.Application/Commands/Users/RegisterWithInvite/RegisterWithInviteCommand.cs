using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Commands.Users.RegisterWithInvite
{
    public sealed class RegisterWithInviteCommand : CommandBase, IRequest
    {
        private static readonly RegisterWithInviteCommandValidation s_validation = new();

        public Guid NewId { get; }
        public RegisterWithInviteViewModel NewRegistration { get; }

        public RegisterWithInviteCommand(Guid newId, RegisterWithInviteViewModel newRegistration) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewRegistration = newRegistration;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
