namespace PhysioBoo.Application.Commands.Laboratory.AcknowledgeLabAlert
{
    public sealed class AcknowledgeLabAlertCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeLabAlertCommandValidation s_validation = new();

        public Guid Id { get; }

        public AcknowledgeLabAlertCommand(Guid id) : base(Guid.NewGuid())
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
