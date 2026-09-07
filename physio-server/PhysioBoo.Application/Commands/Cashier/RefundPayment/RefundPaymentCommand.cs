
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Cashier.RefundPayment
{
    public sealed class RefundPaymentCommand : CommandBase, IRequest
    {
        private static readonly RefundPaymentCommandValidation s_validation = new();

        public RefundPaymentViewModel Refund { get; }

        public RefundPaymentCommand(RefundPaymentViewModel refund) : base(Guid.NewGuid())
        {
            Refund = refund;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
