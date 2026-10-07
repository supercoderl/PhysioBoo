using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.RescheduleImagingSlot
{
    public sealed class RescheduleImagingSlotCommand : CommandBase, IRequest
    {
        private static readonly RescheduleImagingSlotCommandValidation s_validation = new();

        public Guid Id { get; }
        public RescheduleSlotViewModel Body { get; }

        public RescheduleImagingSlotCommand(Guid id, RescheduleSlotViewModel body) : base(Guid.NewGuid())
        {
            Id = id;
            Body = body;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
