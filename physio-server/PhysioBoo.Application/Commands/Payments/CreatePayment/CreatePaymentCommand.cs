using MediatR;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Payments.CreatePayment
{
    public sealed class CreatePaymentCommand : CommandBase, IRequest
    {
        private static readonly CreatePaymentCommandValidation s_validation = new();

        public CreatePaymentViewModel NewPayment { get; }

        public CreatePaymentCommand(CreatePaymentViewModel newPayment) : base(Guid.NewGuid())
        {
            NewPayment = newPayment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
