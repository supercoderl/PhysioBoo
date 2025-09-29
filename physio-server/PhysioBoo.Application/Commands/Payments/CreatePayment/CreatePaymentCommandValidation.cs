using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Payments.CreatePayment
{
    public sealed class CreatePaymentCommandValidation : AbstractValidator<CreatePaymentCommand>
    {
        public CreatePaymentCommandValidation()
        {
            RuleForPaymentNumber();
            RuleForBillId();
            RuleForPatientId();
        }

        public void RuleForPaymentNumber()
        {
            RuleFor(cmd => cmd.NewPayment.PaymentNumber)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Payment.EmptyPaymentNumber)
                .WithMessage("PaymentNumber may not be empty.");
        }

        public void RuleForBillId()
        {
            RuleFor(cmd => cmd.NewPayment.BillId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Payment.EmptyBillId)
                .WithMessage("BillId may not be empty.");
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewPayment.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Payment.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }
    }
}
