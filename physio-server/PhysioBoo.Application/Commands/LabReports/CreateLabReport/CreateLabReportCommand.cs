using MediatR;
using PhysioBoo.Application.ViewModels.LabReports;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.LabReports.CreateLabReport
{
    public sealed class CreateLabReportCommand : CommandBase, IRequest
    {
        private static readonly CreateLabReportCommandValidation s_validation = new();

        public CreateLabReportViewModel NewLabReport { get; }

        public CreateLabReportCommand(CreateLabReportViewModel newLabReport) : base(Guid.NewGuid())
        {
            NewLabReport = newLabReport;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
