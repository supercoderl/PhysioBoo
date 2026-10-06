using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Commands.Members.EnrollMember
{
    public sealed class EnrollMemberCommand : CommandBase, IRequest
    {
        private static readonly EnrollMemberCommandValidation s_validation = new();

        public Guid NewId { get; }
        public EnrollMemberViewModel NewMember { get; }

        public EnrollMemberCommand(Guid newId, EnrollMemberViewModel newMember) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewMember = newMember;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
