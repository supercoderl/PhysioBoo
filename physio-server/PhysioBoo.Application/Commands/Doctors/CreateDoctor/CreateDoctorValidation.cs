using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommandValidation : AbstractValidator<CreateDoctorCommand>
    {
        public CreateDoctorCommandValidation()
        {
            RuleForAccount();
            RuleForIdentity();
            RuleForEmergencyContact();
            RuleForMedicalLicenseNumber();
            RuleForLicenseDetails();
            RuleForExperience();
        }

        public void RuleForAccount()
        {
            RuleFor(cmd => cmd.NewDoctor.Email)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyEmail)
                .WithMessage("Email may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.User.EmailExceedsMaxLength)
                .WithMessage("Email may not be longer than 255 characters.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.User.InvalidEmail)
                .WithMessage("Email is not a valid email address.");

            RuleFor(cmd => cmd.NewDoctor.Phone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPhone)
                .WithMessage("Phone may not be empty.")
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.User.PhoneExceedsMaxLength)
                .WithMessage("Phone may not be longer than 20 characters.")
                .PhoneNumber()
                .WithErrorCode(DomainErrorCodes.User.InvalidPhone)
                .WithMessage("Phone is not a valid phone number.");

            RuleFor(cmd => cmd.NewDoctor.Password).Password();
        }

        public void RuleForIdentity()
        {
            RuleFor(cmd => cmd.NewDoctor.FirstName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyFirstName)
                .WithMessage("FirstName may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("FirstName may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewDoctor.LastName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyLastName)
                .WithMessage("LastName may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("LastName may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewDoctor.MiddleName).MaxLen(100, "MiddleName");

            RuleFor(cmd => cmd.NewDoctor.DateOfBirth)
                .Must(dob => dob.Year >= 1900 && dob <= DateOnly.FromDateTime(DateTime.UtcNow))
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Date of birth must be between 1900 and today.");

            RuleFor(cmd => cmd.NewDoctor.Gender)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Gender is invalid.");

            RuleFor(cmd => cmd.NewDoctor.BloodGroup)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Blood group is invalid.");

            RuleFor(cmd => cmd.NewDoctor.MaritalStatus)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Marital status is invalid.");

            RuleFor(cmd => cmd.NewDoctor.PreferredCommunication)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Preferred communication is invalid.");

            RuleFor(cmd => cmd.NewDoctor.Nationality).MaxLen(100, "Nationality");
            RuleFor(cmd => cmd.NewDoctor.IdentificationType).MaxLen(50, "Identification type");
            RuleFor(cmd => cmd.NewDoctor.IdentificationNumber).MaxLen(100, "Identification number");
        }

        public void RuleForEmergencyContact()
        {
            RuleFor(cmd => cmd.NewDoctor.EmergencyContactName).MaxLen(255, "Emergency contact name");
            RuleFor(cmd => cmd.NewDoctor.EmergencyContactPhone)
                .MaxLen(20, "Emergency contact phone")
                .OptionalPhone("Emergency contact phone");
            RuleFor(cmd => cmd.NewDoctor.EmergencyContactRelationship).MaxLen(50, "Emergency contact relationship");
        }

        public void RuleForMedicalLicenseNumber()
        {
            RuleFor(cmd => cmd.NewDoctor.MedicalLicenseNumber)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Doctor.EmptyMedicalLicenseNumber)
                .WithMessage("Medical license number may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Medical license number may not be longer than 100 characters.");
        }

        public void RuleForLicenseDetails()
        {
            RuleFor(cmd => cmd.NewDoctor.MedicalLicenseExpiry)
                .NotEqual(DateOnly.MinValue)
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Medical license expiry is required.");

            RuleFor(cmd => cmd.NewDoctor.MedicalLicenseIssuingAuthority).MaxLen(255, "Medical license issuing authority");
            RuleFor(cmd => cmd.NewDoctor.PanNumber).MaxLen(20, "PAN number");
            RuleFor(cmd => cmd.NewDoctor.Gstin).MaxLen(20, "GSTIN");
        }

        public void RuleForExperience()
        {
            RuleFor(cmd => cmd.NewDoctor.YearsOfExperience).NotNegative("Years of experience");
            RuleFor(cmd => cmd.NewDoctor.YearsOfPractice).NotNegative("Years of practice");
            RuleFor(cmd => cmd.NewDoctor.PublicationsCount).NotNegative("Publications count");
            RuleFor(cmd => cmd.NewDoctor.ConferencePresentations).NotNegative("Conference presentations");

            RuleFor(cmd => cmd.NewDoctor.EmploymentStatus)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Employment status is invalid.");
        }
    }
}
