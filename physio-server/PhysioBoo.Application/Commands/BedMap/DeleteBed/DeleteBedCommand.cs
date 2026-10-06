namespace PhysioBoo.Application.Commands.BedMap.DeleteBed
{
    public sealed class DeleteBedCommand : CommandBase, IRequest
    {
        private static readonly DeleteBedCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteBedCommand(Guid id) : base(Guid.NewGuid())
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
