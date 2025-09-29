using MediatR;
using PhysioBoo.Application.ViewModels.LabOrders;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabOrders.CreateLabOrder
{
    public sealed class CreateLabOrderCommand : CommandBase, IRequest
    {
        private static readonly CreateLabOrderCommandValidation s_validation = new();

        public CreateLabOrderViewModel NewLabOrder { get; }

        public CreateLabOrderCommand(CreateLabOrderViewModel newLabOrder) : base(Guid.NewGuid())
        {
            NewLabOrder = newLabOrder;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
