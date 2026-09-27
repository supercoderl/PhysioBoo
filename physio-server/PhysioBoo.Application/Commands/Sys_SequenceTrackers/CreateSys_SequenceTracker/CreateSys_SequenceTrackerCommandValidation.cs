using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker
{
    public sealed class CreateSys_SequenceTrackerCommandValidation : AbstractValidator<CreateSys_SequenceTrackerCommand>
    {
        public CreateSys_SequenceTrackerCommandValidation()
        {
            RuleForNewId();
            RuleForEntityType();
            RuleForPrefix();
            RuleForSequence();
        }

        public void RuleForNewId()
        {
            RuleFor(cmd => cmd.NewId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.SequenceTracker.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForEntityType()
        {
            RuleFor(cmd => cmd.NewSys_SequenceTracker.EntityType)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("EntityType may not be empty.");
        }

        public void RuleForPrefix()
        {
            RuleFor(cmd => cmd.NewSys_SequenceTracker.Prefix)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Prefix may not be empty.");
        }

        public void RuleForSequence()
        {
            RuleFor(cmd => cmd.NewSys_SequenceTracker.SequenceLength)
                .GreaterThan(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("SequenceLength must be greater than 0.");

            RuleFor(cmd => cmd.NewSys_SequenceTracker.CurrentSequence).NotNegative("CurrentSequence");
        }
    }
}
