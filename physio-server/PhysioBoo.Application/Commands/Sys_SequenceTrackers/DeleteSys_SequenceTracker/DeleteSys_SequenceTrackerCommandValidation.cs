using FluentValidation;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker
{
    public sealed class DeleteSys_SequenceTrackerCommandValidation : AbstractValidator<DeleteSys_SequenceTrackerCommand>
    {
        public DeleteSys_SequenceTrackerCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}