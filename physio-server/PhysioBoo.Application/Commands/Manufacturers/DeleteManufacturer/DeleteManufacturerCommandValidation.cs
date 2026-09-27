using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer
{
    public sealed class DeleteManufacturerCommandValidation : AbstractValidator<DeleteManufacturerCommand>
    {
        public DeleteManufacturerCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Manufacturer.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
