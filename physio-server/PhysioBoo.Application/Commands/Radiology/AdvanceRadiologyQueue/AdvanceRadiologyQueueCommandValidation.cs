using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.AdvanceRadiologyQueue
{
    public sealed class AdvanceRadiologyQueueCommandValidation : AbstractValidator<AdvanceRadiologyQueueCommand>
    {
        public AdvanceRadiologyQueueCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Body.Status)
                .NotEmpty().WithErrorCode(DomainErrorCodes.RadiologyWorkspace.InvalidQueueStatus).WithMessage("Queue status is required.")
                .Must(s => Enum.TryParse<RadiologyQueueStatus>(s, true, out _)).WithErrorCode(DomainErrorCodes.RadiologyWorkspace.InvalidQueueStatus).WithMessage("Queue status must be Waiting, Called, InProgress, Completed or Cancelled.");
        }
    }
}
