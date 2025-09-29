using FluentValidation;
using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandValidation : AbstractValidator<CreateAddressCommand>
    {
        public CreateAddressCommandValidation()
        {
            RuleForStreet();
            RuleForCity();
            RuleForStateProvince();
            RuleForCountry();
            RuleForLatitude();
            RuleForLongtitude();
        }

        public void RuleForStreet()
        {
            RuleFor(cmd => cmd.NewAddress.Street).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyStreet).WithMessage("Street may not be empty.");
        }

        public void RuleForCity()
        {
            RuleFor(cmd => cmd.NewAddress.City).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyCity).WithMessage("City may not be empty.");
        }

        public void RuleForStateProvince()
        {
            RuleFor(cmd => cmd.NewAddress.StateProvince).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyStateProvince).WithMessage("State province may not be empty.");
        }

        public void RuleForCountry()
        {
            RuleFor(cmd => cmd.NewAddress.Country).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyCountry).WithMessage("Country may not be empty.");
        }

        public void RuleForLatitude()
        {
            RuleFor(cmd => cmd.NewAddress.Latitude).GeographicCoordinate(-90, 90);
        }

        public void RuleForLongtitude()
        {
            RuleFor(cmd => cmd.NewAddress.Longitude).GeographicCoordinate(-180, 180);
        }
    }
}
