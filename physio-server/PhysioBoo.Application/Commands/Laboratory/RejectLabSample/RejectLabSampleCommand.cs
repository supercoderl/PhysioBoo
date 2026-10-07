using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.RejectLabSample
{
    public sealed class RejectLabSampleCommand : CommandBase, IRequest
    {
        private static readonly RejectLabSampleCommandValidation s_validation = new();

        public Guid Id { get; }
        public LabReasonViewModel Body { get; }

        public RejectLabSampleCommand(Guid id, LabReasonViewModel body) : base(Guid.NewGuid())
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
