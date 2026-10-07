using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.RejectRadiologyReport
{
    public sealed class RejectRadiologyReportCommand : CommandBase, IRequest
    {
        private static readonly RejectRadiologyReportCommandValidation s_validation = new();

        public Guid Id { get; }
        public RadiologyReasonViewModel Body { get; }

        public RejectRadiologyReportCommand(Guid id, RadiologyReasonViewModel body) : base(Guid.NewGuid())
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
