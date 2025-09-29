using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandValidation : AbstractValidator<CreateManufacturerCommand>
    {
        public CreateManufacturerCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewManufacturer.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Manufacturer.EmptyName)
                .WithMessage("Name may not be empty.");
        }
    }
}
