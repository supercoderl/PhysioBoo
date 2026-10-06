using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Application.Commands.Members.UpdateMember
{
    public sealed class UpdateMemberCommand : CommandBase, IRequest
    {
        private static readonly UpdateMemberCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateMemberViewModel Member { get; }

        public UpdateMemberCommand(Guid id, UpdateMemberViewModel member) : base(Guid.NewGuid())
        {
            Id = id;
            Member = member;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
