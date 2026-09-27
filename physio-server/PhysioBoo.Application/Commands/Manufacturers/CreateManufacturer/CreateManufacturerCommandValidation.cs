using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandValidation : AbstractValidator<CreateManufacturerCommand>
    {
        public CreateManufacturerCommandValidation()
        {
            RuleForName();
            RuleForContact();
            RuleForLocation();
            RuleForEstablishedYear();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewManufacturer.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Manufacturer.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.NewManufacturer.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.NewManufacturer.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.NewManufacturer.Website).MaxLen(255, "Website").OptionalUrl("Website");
            RuleFor(cmd => cmd.NewManufacturer.LicenseNumber).MaxLen(100, "License number");
        }

        public void RuleForLocation()
        {
            RuleFor(cmd => cmd.NewManufacturer.City).MaxLen(100, "City");
            RuleFor(cmd => cmd.NewManufacturer.State).MaxLen(100, "State");
            RuleFor(cmd => cmd.NewManufacturer.Country).MaxLen(100, "Country");
            RuleFor(cmd => cmd.NewManufacturer.PostalCode).MaxLen(20, "Postal code");
        }

        public void RuleForEstablishedYear()
        {
            RuleFor(cmd => cmd.NewManufacturer.EstablishedYear)
                .Must(year => year == 0 || (year >= 1800 && year <= DateTime.UtcNow.Year))
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Established year is out of range.");
        }
    }
}
