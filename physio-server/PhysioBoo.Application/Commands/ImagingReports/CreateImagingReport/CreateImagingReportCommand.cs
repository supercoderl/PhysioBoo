using MediatR;
using PhysioBoo.Application.ViewModels.ImagingReports;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport
{
    public sealed class CreateImagingReportCommand : CommandBase, IRequest
    {
        private static readonly CreateImagingReportCommandValidation s_validation = new();

        public CreateImagingReportViewModel NewImagingReport { get; }

        public CreateImagingReportCommand(CreateImagingReportViewModel newImagingReport) : base(Guid.NewGuid())
        {
            NewImagingReport = newImagingReport;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
