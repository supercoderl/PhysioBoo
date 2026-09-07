
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Cashier.ReceivePayment
{
    public sealed class ReceivePaymentCommand : CommandBase, IRequest
    {
        private static readonly ReceivePaymentCommandValidation s_validation = new();

        public ReceivePaymentViewModel Payment { get; }

        public ReceivePaymentCommand(ReceivePaymentViewModel payment) : base(Guid.NewGuid())
        {
            Payment = payment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
