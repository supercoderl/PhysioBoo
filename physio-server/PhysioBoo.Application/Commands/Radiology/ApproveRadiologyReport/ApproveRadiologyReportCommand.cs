namespace PhysioBoo.Application.Commands.Radiology.ApproveRadiologyReport
{
    public sealed class ApproveRadiologyReportCommand : CommandBase, IRequest
    {
        private static readonly ApproveRadiologyReportCommandValidation s_validation = new();

        public Guid Id { get; }

        public ApproveRadiologyReportCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
