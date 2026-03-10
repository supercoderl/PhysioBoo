using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker
{
    public sealed class DeleteSys_SequenceTrackerCommand : CommandBase
    {
        private static readonly DeleteSys_SequenceTrackerCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteSys_SequenceTrackerCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
