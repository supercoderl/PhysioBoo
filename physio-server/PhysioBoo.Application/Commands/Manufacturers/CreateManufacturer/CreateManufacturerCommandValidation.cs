using FluentValidation;

namespace PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandValidation : AbstractValidator<CreateManufacturerCommand>
    {
        public CreateManufacturerCommandValidation()
        {

        }
    }
}
