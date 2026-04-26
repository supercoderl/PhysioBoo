using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker
{
    public sealed class UpdateSys_SequenceTrackerCommand : CommandBase
    {
        private static readonly UpdateSys_SequenceTrackerCommandValidation s_validation = new();

        public UpdateSys_SequenceTrackerViewModel Sys_SequenceTracker { get; }
        public Guid Id { get; }

        public UpdateSys_SequenceTrackerCommand(UpdateSys_SequenceTrackerViewModel sys_SequenceTracker, Guid id) : base(Guid.NewGuid())
        {
            Sys_SequenceTracker = sys_SequenceTracker;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
