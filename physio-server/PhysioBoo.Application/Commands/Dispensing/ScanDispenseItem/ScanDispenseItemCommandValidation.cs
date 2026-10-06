using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.ScanDispenseItem
{
    public sealed class ScanDispenseItemCommandValidation : AbstractValidator<ScanDispenseItemCommand>
    {
        public ScanDispenseItemCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.ItemId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Item id may not be empty.");
            RuleFor(c => c.Barcode).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyBarcode).WithMessage("Barcode may not be empty.");
        }
    }
}
