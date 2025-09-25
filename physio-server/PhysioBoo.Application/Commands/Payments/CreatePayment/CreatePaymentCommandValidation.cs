using FluentValidation;

namespace PhysioBoo.Application.Commands.Payments.CreatePayment
{
    public sealed class CreatePaymentCommandValidation : AbstractValidator<CreatePaymentCommand>
    {
        public CreatePaymentCommandValidation()
        {

        }
    }
}
