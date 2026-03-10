using FluentValidation;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker
{
    public sealed class CreateSys_SequenceTrackerCommandValidation : AbstractValidator<CreateSys_SequenceTrackerCommand>
    {
        public CreateSys_SequenceTrackerCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}