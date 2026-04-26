using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Addresses.DeleteAddress
{
    public sealed class DeleteAddressCommandValidation : AbstractValidator<DeleteAddressCommand>
    {
        public DeleteAddressCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id).NotEmpty().WithErrorCode(DomainErrorCodes.Address.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}