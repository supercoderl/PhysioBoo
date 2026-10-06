namespace PhysioBoo.Application.Commands.Dispensing.ReserveDispenseItem
{
    /// <summary>
    /// Holds the line's quantity on its batch (e.g. patient collects later) without dispensing it.
    /// </summary>
    public sealed class ReserveDispenseItemCommand : CommandBase, IRequest
    {
        private static readonly ReserveDispenseItemCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public Guid ItemId { get; }

        public ReserveDispenseItemCommand(Guid prescriptionId, Guid itemId) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            ItemId = itemId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
