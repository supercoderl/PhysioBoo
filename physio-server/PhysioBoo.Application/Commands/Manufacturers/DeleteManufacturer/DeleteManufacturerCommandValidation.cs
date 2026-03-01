using FluentValidation;

namespace PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer
{
    public sealed class DeleteManufacturerCommandValidation : AbstractValidator<DeleteManufacturerCommand>
    {
        public DeleteManufacturerCommandValidation()
        {

        }
    }
}
