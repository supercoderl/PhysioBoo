namespace PhysioBoo.Application.Commands.Dispensing.ScanDispenseItem
{
    public sealed class ScanDispenseItemCommand : CommandBase, IRequest
    {
        private static readonly ScanDispenseItemCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public Guid ItemId { get; }
        public string Barcode { get; }

        /// <summary>
        /// Set by the handler: whether the scanned code belongs to the line's medicine/batch.
        /// </summary>
        public bool Matched { get; set; }

        public ScanDispenseItemCommand(Guid prescriptionId, Guid itemId, string barcode) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            ItemId = itemId;
            Barcode = barcode;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
