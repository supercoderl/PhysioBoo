using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.RejectLabResult
{
    public sealed class RejectLabResultCommand : CommandBase, IRequest
    {
        private static readonly RejectLabResultCommandValidation s_validation = new();

        public Guid Id { get; }
        public LabReasonViewModel Body { get; }

        public RejectLabResultCommand(Guid id, LabReasonViewModel body) : base(Guid.NewGuid())
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
