namespace PhysioBoo.Application.Commands.Dispensing.ReplaceDispenseItem
{
    public sealed class ReplaceDispenseItemCommand : CommandBase, IRequest
    {
        private static readonly ReplaceDispenseItemCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public Guid ItemId { get; }
        public Guid AlternativeMedicineId { get; }
        public string Reason { get; }

        public ReplaceDispenseItemCommand(Guid prescriptionId, Guid itemId, Guid alternativeMedicineId, string reason) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            ItemId = itemId;
            AlternativeMedicineId = alternativeMedicineId;
            Reason = reason;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
