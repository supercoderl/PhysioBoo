using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.SaveRadiologyReport
{
    public sealed class SaveRadiologyReportCommand : CommandBase, IRequest
    {
        private static readonly SaveRadiologyReportCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveRadiologyReportViewModel Body { get; }

        public SaveRadiologyReportCommand(Guid id, SaveRadiologyReportViewModel body) : base(Guid.NewGuid())
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
