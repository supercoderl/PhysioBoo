using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.ReturnRadiologyReportForRevision
{
    public sealed class ReturnRadiologyReportForRevisionCommand : CommandBase, IRequest
    {
        private static readonly ReturnRadiologyReportForRevisionCommandValidation s_validation = new();

        public Guid Id { get; }
        public RadiologyReasonViewModel Body { get; }

        public ReturnRadiologyReportForRevisionCommand(Guid id, RadiologyReasonViewModel body) : base(Guid.NewGuid())
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
