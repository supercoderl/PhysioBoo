using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer
{
    public sealed class UpdateManufacturerCommandValidation : AbstractValidator<UpdateManufacturerCommand>
    {
        public UpdateManufacturerCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForContact();
            RuleForLocation();
            RuleForEstablishedYear();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Manufacturer.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Manufacturer.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Manufacturer.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.Manufacturer.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.Manufacturer.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.Manufacturer.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.Manufacturer.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForLocation()
        {
            RuleFor(cmd => cmd.Manufacturer.City).MaxLen(100, "City");
            RuleFor(cmd => cmd.Manufacturer.State).MaxLen(100, "State");
            RuleFor(cmd => cmd.Manufacturer.Country).MaxLen(100, "Country");
            RuleFor(cmd => cmd.Manufacturer.PostalCode).MaxLen(20, "Postal code");
        }

        public void RuleForEstablishedYear()
        {
            RuleFor(cmd => cmd.Manufacturer.EstablishedYear)
                .Must(year => year == 0 || (year >= 1800 && year <= DateTime.UtcNow.Year))
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Established year is out of range.");
        }
    }
}
