using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Prescriptions.CancelPrescription
{
    public sealed class CancelPrescriptionCommandValidation : AbstractValidator<CancelPrescriptionCommand>
    {
        public CancelPrescriptionCommandValidation()
        {
            RuleForPrescriptionId();
            RuleForReason();
        }

        public void RuleForPrescriptionId()
        {
            RuleFor(cmd => cmd.PrescriptionId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyId)
                .WithMessage("PrescriptionId may not be empty.");
        }

        public void RuleForReason()
        {
            RuleFor(cmd => cmd.Prescription.Reason)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Reason may not be empty.");
        }
    }
}
