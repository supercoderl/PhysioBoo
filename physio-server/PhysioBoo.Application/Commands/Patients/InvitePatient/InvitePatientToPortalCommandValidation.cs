using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Patients.InvitePatient
{
    public sealed class InvitePatientToPortalCommandValidation : AbstractValidator<InvitePatientToPortalCommand>
    {
        public InvitePatientToPortalCommandValidation()
        {
            RuleForPatientId();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyId)
                .WithMessage("PatientId may not be empty.");
        }
    }
}
