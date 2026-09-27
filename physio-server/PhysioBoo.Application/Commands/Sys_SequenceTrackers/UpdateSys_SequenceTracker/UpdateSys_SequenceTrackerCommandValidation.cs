using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker
{
    public sealed class UpdateSys_SequenceTrackerCommandValidation : AbstractValidator<UpdateSys_SequenceTrackerCommand>
    {
        public UpdateSys_SequenceTrackerCommandValidation()
        {
            RuleForId();
            RuleForEntityType();
            RuleForPrefix();
            RuleForSequence();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.SequenceTracker.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForEntityType()
        {
            RuleFor(cmd => cmd.Sys_SequenceTracker.EntityType)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("EntityType may not be empty.");
        }

        public void RuleForPrefix()
        {
            RuleFor(cmd => cmd.Sys_SequenceTracker.Prefix)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Prefix may not be empty.");
        }

        public void RuleForSequence()
        {
            RuleFor(cmd => cmd.Sys_SequenceTracker.SequenceLength)
                .GreaterThan(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("SequenceLength must be greater than 0.");

            RuleFor(cmd => cmd.Sys_SequenceTracker.CurrentSequence).NotNegative("CurrentSequence");
        }
    }
}
