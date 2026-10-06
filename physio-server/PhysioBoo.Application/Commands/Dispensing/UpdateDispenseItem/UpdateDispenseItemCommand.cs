namespace PhysioBoo.Application.Commands.Dispensing.UpdateDispenseItem
{
    public sealed class UpdateDispenseItemCommand : CommandBase, IRequest
    {
        private static readonly UpdateDispenseItemCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public Guid ItemId { get; }
        public int? QtyToDispense { get; }
        public string? Status { get; }
        public string? BatchNo { get; }

        public UpdateDispenseItemCommand(Guid prescriptionId, Guid itemId, int? qtyToDispense, string? status, string? batchNo) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            ItemId = itemId;
            QtyToDispense = qtyToDispense;
            Status = status;
            BatchNo = batchNo;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
