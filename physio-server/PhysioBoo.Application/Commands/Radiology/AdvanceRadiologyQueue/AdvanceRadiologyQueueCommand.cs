using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.AdvanceRadiologyQueue
{
    public sealed class AdvanceRadiologyQueueCommand : CommandBase, IRequest
    {
        private static readonly AdvanceRadiologyQueueCommandValidation s_validation = new();

        public Guid Id { get; }
        public AdvanceQueueViewModel Body { get; }

        public AdvanceRadiologyQueueCommand(Guid id, AdvanceQueueViewModel body) : base(Guid.NewGuid())
        {
            Id = id;
            Body = body;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
