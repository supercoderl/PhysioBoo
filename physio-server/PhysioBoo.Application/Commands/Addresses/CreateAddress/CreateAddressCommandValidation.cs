using FluentValidation;

namespace PhysioBoo.Application.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandValidation : AbstractValidator<CreateAddressCommand>
    {
        public CreateAddressCommandValidation()
        {

        }
    }
}
