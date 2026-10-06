namespace PhysioBoo.Application.Commands.Dispensing.ChangeDispenseStatus
{
    public sealed class ChangeDispenseStatusCommand : CommandBase, IRequest
    {
        private static readonly ChangeDispenseStatusCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public DispenseSessionAction Action { get; }
        public string Reason { get; }

        public ChangeDispenseStatusCommand(Guid prescriptionId, DispenseSessionAction action, string reason) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            Action = action;
            Reason = reason;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
