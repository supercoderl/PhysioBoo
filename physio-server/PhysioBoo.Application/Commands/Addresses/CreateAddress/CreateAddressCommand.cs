using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommand : CommandBase, IRequest
    {
        private static readonly CreateAddressCommandValidation s_validation = new();

        public CreateAddressViewModel NewAddress { get; }

        public CreateAddressCommand(CreateAddressViewModel newAddress) : base(Guid.NewGuid())
        {
            NewAddress = newAddress;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
