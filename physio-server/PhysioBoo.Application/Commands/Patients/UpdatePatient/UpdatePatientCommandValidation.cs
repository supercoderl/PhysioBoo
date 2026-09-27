using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Patients.UpdatePatient
{
    public sealed class UpdatePatientCommandValidation : AbstractValidator<UpdatePatientCommand>
    {
        public UpdatePatientCommandValidation()
        {
            RuleForId();
            RuleForPrimaryDoctorId();
            RuleForEnums();
            RuleForInsurance();
            RuleForProfileText();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForPrimaryDoctorId()
        {
            RuleFor(cmd => cmd.Patient.PrimaryDoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyPrimaryDoctorId)
                .WithMessage("PrimaryDoctorId may not be empty.");
        }

        public void RuleForEnums()
        {
            RuleFor(cmd => cmd.Patient.PatientType)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Patient type is invalid.");

            RuleFor(cmd => cmd.Patient.RiskLevel)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Risk level is invalid.");
        }

        public void RuleForInsurance()
        {
            RuleFor(cmd => cmd.Patient.InssuranceProvider).MaxLen(255, "Insurance provider");
            RuleFor(cmd => cmd.Patient.InssurancePolicyNumber).MaxLen(100, "Insurance policy number");
            RuleFor(cmd => cmd.Patient.InssuranceCoverageAmount).NotNegative("Insurance coverage amount");
        }

        public void RuleForProfileText()
        {
            RuleFor(cmd => cmd.Patient.PreferredAppointmentTime).MaxLen(20, "Preferred appointment time");
            RuleFor(cmd => cmd.Patient.Occupation).MaxLen(255, "Occupation");
            RuleFor(cmd => cmd.Patient.AnnualIncomeRange).MaxLen(50, "Annual income range");
        }
    }
}
