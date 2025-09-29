using FluentValidation;

namespace PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder
{
    public sealed class CreateImagingOrderCommandValidation : AbstractValidator<CreateImagingOrderCommand>
    {
        public CreateImagingOrderCommandValidation()
        {

        }
    }
}
