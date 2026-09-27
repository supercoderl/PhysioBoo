using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandValidation : AbstractValidator<CreateSupplierCommand>
    {
        public CreateSupplierCommandValidation()
        {
            RuleForSupplierName();
            RuleForType();
            RuleForAddress();
            RuleForCity();
            RuleForStateProvince();
            RuleForCountry();
            RuleForContact();
            RuleForRegistrationNumbers();
            RuleForFinancials();
            RuleForRatings();
        }

        public void RuleForSupplierName()
        {
            RuleFor(cmd => cmd.NewSupplier.SupplierName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptySupplierName)
                .WithMessage("SupplierName may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("SupplierName may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.NewSupplier.Type)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Type is invalid.");
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.NewSupplier.Address)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyAddress)
                .WithMessage("Address may not be empty.");
        }

        public void RuleForCity()
        {
            RuleFor(cmd => cmd.NewSupplier.City)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCity)
                .WithMessage("City may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("City may not be longer than 100 characters.");
        }

        public void RuleForStateProvince()
        {
            RuleFor(cmd => cmd.NewSupplier.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyStateProvince)
                .WithMessage("StateProvince may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("StateProvince may not be longer than 100 characters.");
        }

        public void RuleForCountry()
        {
            RuleFor(cmd => cmd.NewSupplier.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCountry)
                .WithMessage("Country may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Country may not be longer than 100 characters.");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.NewSupplier.PostalCode).MaxLen(20, "Postal code");
            RuleFor(cmd => cmd.NewSupplier.ContactPerson).MaxLen(255, "Contact person");
            RuleFor(cmd => cmd.NewSupplier.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.NewSupplier.AlternatePhone).MaxLen(20, "Alternate phone").OptionalPhone("Alternate phone");
            RuleFor(cmd => cmd.NewSupplier.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.NewSupplier.Website).MaxLen(255, "Website").OptionalUrl("Website");
        }

        public void RuleForRegistrationNumbers()
        {
            RuleFor(cmd => cmd.NewSupplier.BusinessRegistrationNumber).MaxLen(100, "Business registration number");
            RuleFor(cmd => cmd.NewSupplier.TaxIdentificationNumber).MaxLen(100, "Tax identification number");
            RuleFor(cmd => cmd.NewSupplier.GstNumber).MaxLen(20, "GST number");
            RuleFor(cmd => cmd.NewSupplier.PanNumber).MaxLen(20, "PAN number");
            RuleFor(cmd => cmd.NewSupplier.DrugLicenseNumber).MaxLen(100, "Drug license number");
            RuleFor(cmd => cmd.NewSupplier.FdaRegistrationNumber).MaxLen(100, "FDA registration number");
            RuleFor(cmd => cmd.NewSupplier.IsoCertification).MaxLen(100, "ISO certification");
        }

        public void RuleForFinancials()
        {
            RuleFor(cmd => cmd.NewSupplier.CreditLimit).NotNegative("Credit limit");
            RuleFor(cmd => cmd.NewSupplier.MinimumOrderValue).NotNegative("Minimum order value");
            RuleFor(cmd => cmd.NewSupplier.TotalPurchaseValue).NotNegative("Total purchase value");
            RuleFor(cmd => cmd.NewSupplier.LeadTimeDays).NotNegative("Lead time days");
            RuleFor(cmd => cmd.NewSupplier.TotalOrders).NotNegative("Total orders");
        }

        public void RuleForRatings()
        {
            RuleFor(cmd => cmd.NewSupplier.DeliveryReliabilityScore)
                .InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Delivery reliability score must be between 0 and 5.");

            RuleFor(cmd => cmd.NewSupplier.QualityRating)
                .InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Quality rating must be between 0 and 5.");

            RuleFor(cmd => cmd.NewSupplier.ServiceRating)
                .InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Service rating must be between 0 and 5.");
        }
    }
}
