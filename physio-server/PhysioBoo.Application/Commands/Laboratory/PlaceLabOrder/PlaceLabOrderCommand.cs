using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.PlaceLabOrder
{
    public sealed class PlaceLabOrderCommand : CommandBase, IRequest
    {
        private static readonly PlaceLabOrderCommandValidation s_validation = new();

        public Guid NewId { get; }
        public PlaceLabOrderViewModel Order { get; }

        public PlaceLabOrderCommand(Guid newId, PlaceLabOrderViewModel order) : base(Guid.NewGuid())
        {
            NewId = newId;
            Order = order;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
