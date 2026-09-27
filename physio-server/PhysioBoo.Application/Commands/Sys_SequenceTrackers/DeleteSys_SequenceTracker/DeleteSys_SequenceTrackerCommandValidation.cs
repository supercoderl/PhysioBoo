using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker
{
    public sealed class DeleteSys_SequenceTrackerCommandValidation : AbstractValidator<DeleteSys_SequenceTrackerCommand>
    {
        public DeleteSys_SequenceTrackerCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.SequenceTracker.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
