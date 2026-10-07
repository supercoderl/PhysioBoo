using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.CancelImagingSlot
{
    public sealed class CancelImagingSlotCommand : CommandBase, IRequest
    {
        private static readonly CancelImagingSlotCommandValidation s_validation = new();

        public Guid Id { get; }
        public RadiologyReasonViewModel Body { get; }

        public CancelImagingSlotCommand(Guid id, RadiologyReasonViewModel body) : base(Guid.NewGuid())
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
