
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.SmsReceipt
{
    public sealed class SmsReceiptCommand : CommandBase, IRequest
    {
        private static readonly SmsReceiptCommandValidation s_validation = new();

        public Guid TransactionId { get; }
        public SmsReceiptViewModel Request { get; }

        public SmsReceiptCommand(Guid transactionId, SmsReceiptViewModel request) : base(Guid.NewGuid())
        {
            TransactionId = transactionId;
            Request = request;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
