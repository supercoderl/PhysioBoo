using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.RecollectLabSample
{
    public sealed class RecollectLabSampleCommand : CommandBase, IRequest
    {
        private static readonly RecollectLabSampleCommandValidation s_validation = new();

        public Guid Id { get; }
        public LabReasonViewModel Body { get; }

        public RecollectLabSampleCommand(Guid id, LabReasonViewModel body) : base(Guid.NewGuid())
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
