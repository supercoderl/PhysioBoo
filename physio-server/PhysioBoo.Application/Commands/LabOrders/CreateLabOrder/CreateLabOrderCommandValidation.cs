using FluentValidation;

namespace PhysioBoo.Application.Commands.LabOrders.CreateLabOrder
{
    public sealed class CreateLabOrderCommandValidation : AbstractValidator<CreateLabOrderCommand>
    {
        public CreateLabOrderCommandValidation()
        {

        }
    }
}
