using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Hospitals.UpdateHospital
{
    public sealed class UpdateHospitalCommandValidation : AbstractValidator<UpdateHospitalCommand>
    {
        public UpdateHospitalCommandValidation()
        {
            RuleForId();
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

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForHospitalGroupId()
        {
            RuleFor(cmd => cmd.Hospital.HospitalGroupId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyHospitalGroupId)
                .WithMessage("HospitalGroupId may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Hospital.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.Hospital.HospitalType)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Hospital type is invalid.");
        }

        public void RuleForCapacities()
        {
            RuleFor(cmd => cmd.Hospital.EmergencyCapacity).NotNegative("Emergency capacity");
            RuleFor(cmd => cmd.Hospital.BedCapacity).NotNegative("Bed capacity");
            RuleFor(cmd => cmd.Hospital.IcuCapacity).NotNegative("ICU capacity");
            RuleFor(cmd => cmd.Hospital.OperationTheaters).NotNegative("Operation theaters");
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.Hospital.Address)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAddress)
                .WithMessage("Address may not be empty.");

            RuleFor(cmd => cmd.Hospital.City)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCity)
                .WithMessage("City may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("City may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Hospital.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyStateProvince)
                .WithMessage("State/Province may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("State/Province may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Hospital.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyCountry)
                .WithMessage("Country may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Country may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Hospital.PostalCode).MaxLen(20, "Postal code");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.Hospital.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.Hospital.Fax).MaxLen(20, "Fax").OptionalPhone("Fax");
            RuleFor(cmd => cmd.Hospital.EmergencyPhone).MaxLen(20, "Emergency phone").OptionalPhone("Emergency phone");
            RuleFor(cmd => cmd.Hospital.AmbulancePhone).MaxLen(20, "Ambulance phone").OptionalPhone("Ambulance phone");
            RuleFor(cmd => cmd.Hospital.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.Hospital.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.Hospital.LogoUrl).MaxLen(500, "Logo URL");
        }

        public void RuleForCoordinates()
        {
            RuleFor(cmd => cmd.Hospital.Latitude)
                .InclusiveBetween(-90m, 90m)
                .WithErrorCode(DomainErrorCodes.Address.InvalidGeographicCoordinate)
                .WithMessage("Latitude must be between -90 and 90 degrees.");

            RuleFor(cmd => cmd.Hospital.Longtitude)
                .InclusiveBetween(-180m, 180m)
                .WithErrorCode(DomainErrorCodes.Address.InvalidGeographicCoordinate)
                .WithMessage("Longitude must be between -180 and 180 degrees.");
        }

        public void RuleForLicense()
        {
            RuleFor(cmd => cmd.Hospital.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForAccreditationBody()
        {
            RuleFor(cmd => cmd.Hospital.AccreditationBody)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyAccreditationBody)
                .WithMessage("AccreditationBody may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("AccreditationBody may not be longer than 255 characters.");
        }

        public void RuleForInsuranceAccepted()
        {
            RuleFor(cmd => cmd.Hospital.InsuranceAccepted)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyInsuranceAccepted)
                .WithMessage("InsuranceAccepted may not be empty.");
        }

        public void RuleForLanguagesSupported()
        {
            RuleFor(cmd => cmd.Hospital.LanguagesSupported)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Hospital.EmptyLanguagesSupported)
                .WithMessage("LanguagesSupported may not be empty.");
        }
    }
}
