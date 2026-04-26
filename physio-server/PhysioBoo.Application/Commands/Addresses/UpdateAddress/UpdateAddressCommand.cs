using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Addresses.UpdateAddress
{
    public sealed class UpdateAddressCommand : CommandBase, IRequest
    {
        private static readonly UpdateAddressCommandValidation s_validation = new();

        public UpdateAddressViewModel Address { get; }
        public Guid Id { get; }

        public UpdateAddressCommand(UpdateAddressViewModel address, Guid id) : base(Guid.NewGuid())
        {
            Address = address;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
