using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Addresses.DeleteAddress
{
    public sealed class DeleteAddressCommand : CommandBase, IRequest
    {
        private static readonly DeleteAddressCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteAddressCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
