namespace PhysioBoo.Application.Commands.BedMap.DeleteWard
{
    public sealed class DeleteWardCommand : CommandBase, IRequest
    {
        private static readonly DeleteWardCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteWardCommand(Guid id) : base(Guid.NewGuid())
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
