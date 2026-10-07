using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.RescheduleImagingSlot
{
    public sealed class RescheduleImagingSlotCommandValidation : AbstractValidator<RescheduleImagingSlotCommand>
    {
        public RescheduleImagingSlotCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.ScheduledTime)
                .NotNull().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.InvalidScheduledTime).WithMessage("Scheduled time is required.");

            RuleFor(c => c.Body.RoomName)
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.RoomNameExceedsMaxLength).WithMessage("Room name may not exceed 100 characters.");
        }
    }
}
