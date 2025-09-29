using MediatR;
using PhysioBoo.Application.ViewModels.ImagingOrders;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder
{
    public sealed class CreateImagingOrderCommand : CommandBase, IRequest
    {
        private static readonly CreateImagingOrderCommandValidation s_validation = new();

        public CreateImagingOrderViewModel NewImagingOrder { get; }
        public Guid UserId { get; }

        public CreateImagingOrderCommand(CreateImagingOrderViewModel newImagingOrder, Guid userId) : base(Guid.NewGuid())
        {
            NewImagingOrder = newImagingOrder;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
