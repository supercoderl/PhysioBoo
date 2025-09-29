using MediatR;
using PhysioBoo.Application.ViewModels.LabOrderItems;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem
{
    public sealed class CreateLabOrderItemCommand : CommandBase, IRequest
    {
        private static readonly CreateLabOrderItemCommandValidation s_validation = new();

        public CreateLabOrderItemViewModel NewLabOrderItem { get; }

        public CreateLabOrderItemCommand(CreateLabOrderItemViewModel newLabOrderItem) : base(Guid.NewGuid())
        {
            NewLabOrderItem = newLabOrderItem;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
