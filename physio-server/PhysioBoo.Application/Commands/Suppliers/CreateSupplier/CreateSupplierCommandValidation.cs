using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandValidation : AbstractValidator<CreateSupplierCommand>
    {
        public CreateSupplierCommandValidation()
        {
            RuleForSupplierName();
            RuleForAddress();
            RuleForCity();
            RuleForStateProvince();
            RuleForCountry();
        }

        public void RuleForSupplierName()
        {
            RuleFor(cmd => cmd.NewSupplier.SupplierName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptySupplierName)
                .WithMessage("SupplierName may not be empty.");
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
                .WithMessage("City may not be empty.");
        }

        public void RuleForStateProvince()
        {
            RuleFor(cmd => cmd.NewSupplier.StateProvince)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyStateProvince)
                .WithMessage("StateProvince may not be empty.");
        }

        public void RuleForCountry()
        {
            RuleFor(cmd => cmd.NewSupplier.Country)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyCountry)
                .WithMessage("Country may not be empty.");
        }
    }
}
