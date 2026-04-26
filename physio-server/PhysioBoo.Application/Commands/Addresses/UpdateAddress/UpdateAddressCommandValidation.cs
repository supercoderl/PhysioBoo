using FluentValidation;
using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Addresses.UpdateAddress
{
    public sealed class UpdateAddressCommandValidation : AbstractValidator<UpdateAddressCommand>
    {
        public UpdateAddressCommandValidation()
        {
            RuleForId();
            RuleForStreet();
            RuleForCity();
            RuleForStateProvince();
            RuleForCountry();
            RuleForLatitude();
            RuleForLongtitude();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyId).WithMessage("Id may not be empty.");
        }

        public void RuleForStreet()
        {
            RuleFor(cmd => cmd.Address.Street).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyStreet).WithMessage("Street may not be empty.");
        }

        public void RuleForCity()
        {
            RuleFor(cmd => cmd.Address.City).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyCity).WithMessage("City may not be empty.");
        }

        public void RuleForStateProvince()
        {
            RuleFor(cmd => cmd.Address.StateProvince).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyStateProvince).WithMessage("State province may not be empty.");
        }

        public void RuleForCountry()
        {
            RuleFor(cmd => cmd.Address.Country).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyCountry).WithMessage("Country may not be empty.");
        }

        public void RuleForLatitude()
        {
            RuleFor(cmd => cmd.Address.Latitude).GeographicCoordinate(-90, 90);
        }

        public void RuleForLongtitude()
        {
            RuleFor(cmd => cmd.Address.Longitude).GeographicCoordinate(-180, 180);
        }
    }
}