using PhysioBoo.Application.ViewModels.Invites;

namespace PhysioBoo.Application.Commands.Invites.CreateInvite
{
    public sealed class CreateInviteCommand : CommandBase, IRequest
    {
        private static readonly CreateInviteCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateInviteViewModel NewInvitation { get; }

        public CreateInviteCommand(Guid newId, CreateInviteViewModel newInvitation) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewInvitation = newInvitation;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
