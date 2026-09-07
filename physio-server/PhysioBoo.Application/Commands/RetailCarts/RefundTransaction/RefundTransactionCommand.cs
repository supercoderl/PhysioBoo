
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.RefundTransaction
{
    public sealed class RefundTransactionCommand : CommandBase, IRequest
    {
        private static readonly RefundTransactionCommandValidation s_validation = new();

        public Guid TransactionId { get; }
        public RefundTransactionViewModel Refund { get; }

        public RefundTransactionCommand(Guid transactionId, RefundTransactionViewModel refund) : base(Guid.NewGuid())
        {
            TransactionId = transactionId;
            Refund = refund;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
