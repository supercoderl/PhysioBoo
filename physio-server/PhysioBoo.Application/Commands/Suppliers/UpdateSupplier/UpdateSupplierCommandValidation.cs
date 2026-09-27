using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Suppliers.UpdateSupplier
{
    public sealed class UpdateSupplierCommandValidation : AbstractValidator<UpdateSupplierCommand>
    {
        public UpdateSupplierCommandValidation()
        {
            RuleForId();
            RuleForSupplierName();
            RuleForType();
            RuleForAddress();
            RuleForContact();
            RuleForRegistrationNumbers();
            RuleForFinancials();
            RuleForRatings();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForSupplierName()
        {
            RuleFor(cmd => cmd.Supplier.SupplierName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptySupplierName)
                .WithMessage("SupplierName may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("SupplierName may not be longer than 255 characters.");
        }

        public void RuleForType()
        {
            RuleFor(cmd => cmd.Supplier.Type)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Type is invalid.");
        }

        public void RuleForAddress()
        {
            RuleFor(cmd => cmd.Supplier.Address)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyAddress)
                .WithMessage("Address may not be empty.");

            RuleFor(cmd => cmd.Supplier.City)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCity)
                .WithMessage("City may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("City may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Supplier.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyStateProvince)
                .WithMessage("StateProvince may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("StateProvince may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Supplier.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCountry)
                .WithMessage("Country may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Country may not be longer than 100 characters.");

            RuleFor(cmd => cmd.Supplier.PostalCode).MaxLen(20, "Postal code");
        }

        public void RuleForContact()
        {
            RuleFor(cmd => cmd.Supplier.ContactPerson).MaxLen(255, "Contact person");
            RuleFor(cmd => cmd.Supplier.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.Supplier.AlternatePhone).MaxLen(20, "Alternate phone").OptionalPhone("Alternate phone");
            RuleFor(cmd => cmd.Supplier.Email).MaxLen(255, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.Supplier.Website).MaxLen(255, "Website").OptionalUrl("Website");
        }

        public void RuleForRegistrationNumbers()
        {
            RuleFor(cmd => cmd.Supplier.BusinessRegistrationNumber).MaxLen(100, "Business registration number");
            RuleFor(cmd => cmd.Supplier.TaxIdentificationNumber).MaxLen(100, "Tax identification number");
            RuleFor(cmd => cmd.Supplier.GstNumber).MaxLen(20, "GST number");
            RuleFor(cmd => cmd.Supplier.PanNumber).MaxLen(20, "PAN number");
            RuleFor(cmd => cmd.Supplier.DrugLicenseNumber).MaxLen(100, "Drug license number");
            RuleFor(cmd => cmd.Supplier.FdaRegistrationNumber).MaxLen(100, "FDA registration number");
            RuleFor(cmd => cmd.Supplier.IsoCertification).MaxLen(100, "ISO certification");
        }

        public void RuleForFinancials()
        {
            RuleFor(cmd => cmd.Supplier.Currency)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCurrency)
                .WithMessage("Currency may not be empty.")
                .MaximumLength(10)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Currency may not be longer than 10 characters.");

            RuleFor(cmd => cmd.Supplier.CreditLimit).NotNegative("Credit limit");
            RuleFor(cmd => cmd.Supplier.MinimumOrderValue).NotNegative("Minimum order value");
            RuleFor(cmd => cmd.Supplier.TotalPurchaseValue).NotNegative("Total purchase value");
            RuleFor(cmd => cmd.Supplier.LeadTimeDays).NotNegative("Lead time days");
            RuleFor(cmd => cmd.Supplier.TotalOrders).NotNegative("Total orders");
        }

        public void RuleForRatings()
        {
            // numeric(3,2) columns: 0.00 - 9.99, business range is 0 - 5
            RuleFor(cmd => cmd.Supplier.DeliveryReliabilityScore).InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Delivery reliability score must be between 0 and 5.");
            RuleFor(cmd => cmd.Supplier.QualityRating).InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Quality rating must be between 0 and 5.");
            RuleFor(cmd => cmd.Supplier.ServiceRating).InclusiveBetween(0m, 5m)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Service rating must be between 0 and 5.");
        }
    }
}
