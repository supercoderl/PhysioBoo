using MediatR;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker
{
    public sealed class CreateSys_SequenceTrackerCommand : CommandBase, IRequest
    {
        private static readonly CreateSys_SequenceTrackerCommandValidation s_validation = new();

        public CreateSys_SequenceTrackerViewModel NewSys_SequenceTracker { get; }
        public Guid NewId { get; }

        public CreateSys_SequenceTrackerCommand(CreateSys_SequenceTrackerViewModel newSys_SequenceTracker, Guid newId) : base(Guid.NewGuid())
        {
            NewSys_SequenceTracker = newSys_SequenceTracker;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
