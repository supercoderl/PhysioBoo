using MediatR;
using PhysioBoo.Application.ViewModels.ImagingOrders;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder
{
    public sealed class CreateImagingOrderCommand : CommandBase, IRequest
    {
        private static readonly CreateImagingOrderCommandValidation s_validation = new();

        public CreateImagingOrderViewModel NewImagingOrder { get; }

        public CreateImagingOrderCommand(CreateImagingOrderViewModel newImagingOrder) : base(Guid.NewGuid())
        {
            NewImagingOrder = newImagingOrder;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
