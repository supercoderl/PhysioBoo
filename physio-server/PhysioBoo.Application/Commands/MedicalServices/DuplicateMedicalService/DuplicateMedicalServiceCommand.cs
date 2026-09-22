namespace PhysioBoo.Application.Commands.MedicalServices.DuplicateMedicalService
{
    public sealed class DuplicateMedicalServiceCommand : CommandBase, IRequest
    {
        private static readonly DuplicateMedicalServiceCommandValidation s_validation = new();

        public Guid SourceId { get; }
        public Guid NewId { get; }

        public DuplicateMedicalServiceCommand(Guid sourceId, Guid newId) : base(Guid.NewGuid())
        {
            SourceId = sourceId;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
