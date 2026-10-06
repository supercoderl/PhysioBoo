namespace PhysioBoo.Application.Commands.Members.DeleteMember
{
    public sealed class DeleteMemberCommand : CommandBase, IRequest
    {
        private static readonly DeleteMemberCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteMemberCommand(Guid id) : base(Guid.NewGuid())
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
