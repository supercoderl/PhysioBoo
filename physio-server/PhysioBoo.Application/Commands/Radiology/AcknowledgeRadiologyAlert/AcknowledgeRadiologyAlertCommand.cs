namespace PhysioBoo.Application.Commands.Radiology.AcknowledgeRadiologyAlert
{
    public sealed class AcknowledgeRadiologyAlertCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeRadiologyAlertCommandValidation s_validation = new();

        public Guid Id { get; }

        public AcknowledgeRadiologyAlertCommand(Guid id) : base(Guid.NewGuid())
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
