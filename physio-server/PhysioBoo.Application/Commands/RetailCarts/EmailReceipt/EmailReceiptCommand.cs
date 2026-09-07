
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.EmailReceipt
{
    public sealed class EmailReceiptCommand : CommandBase, IRequest
    {
        private static readonly EmailReceiptCommandValidation s_validation = new();

        public Guid TransactionId { get; }
        public EmailReceiptViewModel Request { get; }

        public EmailReceiptCommand(Guid transactionId, EmailReceiptViewModel request) : base(Guid.NewGuid())
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
