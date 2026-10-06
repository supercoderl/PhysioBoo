using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Commands.TreatmentSheet.UpdateOrderStatus
{
    public sealed class UpdateTreatmentOrderStatusCommand : CommandBase, IRequest
    {
        private static readonly UpdateTreatmentOrderStatusCommandValidation s_validation = new();

        public Guid OrderId { get; }
        public UpdateTreatmentOrderStatusViewModel Input { get; }

        // Filled by the handler so the endpoint can return the updated order.
        public TreatmentOrderViewModel? Result { get; set; }

        public UpdateTreatmentOrderStatusCommand(Guid orderId, UpdateTreatmentOrderStatusViewModel input) : base(Guid.NewGuid())
        {
            OrderId = orderId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
