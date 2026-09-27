using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommandValidation : AbstractValidator<CreatePatientCommand>
    {
        public CreatePatientCommandValidation()
        {
            RuleForPrimaryDoctorId();
            RuleForInsurance();
            RuleForProfileText();
            RuleForProfileIdentity();
            RuleForProfileContact();
        }

        public void RuleForPrimaryDoctorId()
        {
            RuleFor(cmd => cmd.NewPatient.PrimaryDoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyPrimaryDoctorId)
                .WithMessage("PrimaryDoctorId may not be empty.");
        }

        public void RuleForInsurance()
        {
            RuleFor(cmd => cmd.NewPatient.InssuranceProvider).MaxLen(255, "Insurance provider");
            RuleFor(cmd => cmd.NewPatient.InssurancePolicyNumber).MaxLen(100, "Insurance policy number");
            RuleFor(cmd => cmd.NewPatient.InssuranceCoverageAmount).NotNegative("Insurance coverage amount");
        }

        public void RuleForProfileText()
        {
            RuleFor(cmd => cmd.NewPatient.PreferredAppointmentTime).MaxLen(20, "Preferred appointment time");
            RuleFor(cmd => cmd.NewPatient.Occupation).MaxLen(255, "Occupation");
            RuleFor(cmd => cmd.NewPatient.AnnualIncomeRange).MaxLen(50, "Annual income range");
        }

        public void RuleForProfileIdentity()
        {
            RuleFor(cmd => cmd.NewPatient.Profile.FirstName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyFirstName)
                .WithMessage("FirstName may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("FirstName may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewPatient.Profile.LastName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyLastName)
                .WithMessage("LastName may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("LastName may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewPatient.Profile.DateOfBirth)
                .Must(dob => dob.Year >= 1900 && dob <= DateOnly.FromDateTime(DateTime.UtcNow))
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Date of birth must be between 1900 and today.");

            RuleFor(cmd => cmd.NewPatient.Profile.Gender)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Gender is invalid.");

            RuleFor(cmd => cmd.NewPatient.Profile.BloodGroup)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Blood group is invalid.");

            RuleFor(cmd => cmd.NewPatient.Profile.MaritalStatus)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Marital status is invalid.");
        }

        public void RuleForProfileContact()
        {
            RuleFor(cmd => cmd.NewPatient.Profile.Email)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyEmail)
                .WithMessage("Email may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.User.EmailExceedsMaxLength)
                .WithMessage("Email may not be longer than 255 characters.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.User.InvalidEmail)
                .WithMessage("Email is not a valid email address.");

            RuleFor(cmd => cmd.NewPatient.Profile.Phone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPhone)
                .WithMessage("Phone may not be empty.")
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.User.PhoneExceedsMaxLength)
                .WithMessage("Phone may not be longer than 20 characters.")
                .PhoneNumber()
                .WithErrorCode(DomainErrorCodes.User.InvalidPhone)
                .WithMessage("Phone is not a valid phone number.");

            RuleFor(cmd => cmd.NewPatient.Profile.EmergencyContactName).MaxLen(255, "Emergency contact name");
            RuleFor(cmd => cmd.NewPatient.Profile.EmergencyContactPhone)
                .MaxLen(20, "Emergency contact phone")
                .OptionalPhone("Emergency contact phone");
        }
    }
}
