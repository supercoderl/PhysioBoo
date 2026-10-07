using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.PlaceImagingOrder
{
    public sealed class PlaceImagingOrderCommand : CommandBase, IRequest
    {
        private static readonly PlaceImagingOrderCommandValidation s_validation = new();

        public Guid NewId { get; }
        public PlaceImagingOrderViewModel Order { get; }

        public PlaceImagingOrderCommand(Guid newId, PlaceImagingOrderViewModel order) : base(Guid.NewGuid())
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
