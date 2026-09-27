using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommandValidation : AbstractValidator<CreateHospitalCommand>
    {
        public CreateHospitalCommandValidation()
        {
            RuleForHospitalGroupId();
            RuleForName();
            RuleForType();
            RuleForCapacities();
            RuleForAddress();
            RuleForContact();
            RuleForCoordinates();
            RuleForLicense();
            RuleForAccreditationBody();
            RuleForInsuranceAccepted();
            RuleForLanguagesSupported();
        }

        public void RuleForHospitalGroupId()
        {
            RuleFor(cmd => cmd.NewHospital.HospitalGroupId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyHospitalGroupId)
                .WithMessage("HospitalGroupId may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewHospital.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.NewHospital.HospitalType)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Hospital type is invalid.");
        }

        public void RuleForCapacities()
        {
            RuleFor(cmd => cmd.NewHospital.EmergencyCapacity).NotNegative("Emergency capacity");
            RuleFor(cmd => cmd.NewHospital.OperationTheaters).NotNegative("Operation theaters");
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.NewHospital.Address)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAddress)
                .WithMessage("Address may not be empty.");

            RuleFor(cmd => cmd.NewHospital.City)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCity)
                .WithMessage("City may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("City may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewHospital.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyStateProvince)
                .WithMessage("State/Province may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("State/Province may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewHospital.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCountry)
                .WithMessage("Country may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Country may not be longer than 100 characters.");

            RuleFor(cmd => cmd.NewHospital.PostalCode).MaxLen(20, "Postal code");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.NewHospital.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.NewHospital.Fax).MaxLen(20, "Fax").OptionalPhone("Fax");
            RuleFor(cmd => cmd.NewHospital.EmergencyPhone).MaxLen(20, "Emergency phone").OptionalPhone("Emergency phone");
            RuleFor(cmd => cmd.NewHospital.AmbulancePhone).MaxLen(20, "Ambulance phone").OptionalPhone("Ambulance phone");
            RuleFor(cmd => cmd.NewHospital.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.NewHospital.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.NewHospital.LogoUrl).MaxLen(500, "Logo URL");
        }

        public void RuleForCoordinates()
        {
            RuleFor(cmd => cmd.NewHospital.Latitude)
                .InclusiveBetween(-90m, 90m)
                .WithErrorCode(DomainErrorCodes.Address.InvalidGeographicCoordinate)
                .WithMessage("Latitude must be between -90 and 90 degrees.");

            RuleFor(cmd => cmd.NewHospital.Longtitude)
                .InclusiveBetween(-180m, 180m)
                .WithErrorCode(DomainErrorCodes.Address.InvalidGeographicCoordinate)
                .WithMessage("Longitude must be between -180 and 180 degrees.");
        }

        public void RuleForLicense()
        {
            RuleFor(cmd => cmd.NewHospital.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForAccreditationBody()
        {
            RuleFor(cmd => cmd.NewHospital.AccreditationBody)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAccreditationBody)
                .WithMessage("AccreditationBody may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("AccreditationBody may not be longer than 255 characters.");
        }

        public void RuleForInsuranceAccepted()
        {
            RuleFor(cmd => cmd.NewHospital.InsuranceAccepted)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyInsuranceAccepted)
                .WithMessage("InsuranceAccepted may not be empty.");
        }

        public void RuleForLanguagesSupported()
        {
            RuleFor(cmd => cmd.NewHospital.LanguagesSupported)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyLanguagesSupported)
                .WithMessage("LanguagesSupported may not be empty.");
        }
    }
}
