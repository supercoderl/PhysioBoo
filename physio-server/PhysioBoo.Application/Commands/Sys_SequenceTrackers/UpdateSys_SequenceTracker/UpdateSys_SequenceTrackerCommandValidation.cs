using FluentValidation;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker
{
    public sealed class UpdateSys_SequenceTrackerCommandValidation : AbstractValidator<UpdateSys_SequenceTrackerCommand>
    {
        public UpdateSys_SequenceTrackerCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}