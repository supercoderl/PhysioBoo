using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport
{
    public sealed class CreateImagingReportCommandValidation : AbstractValidator<CreateImagingReportCommand>
    {
        public CreateImagingReportCommandValidation()
        {
            RuleForImagingOrderId();
            RuleForPatientId();
        }

        public void RuleForImagingOrderId()
        {
            RuleFor(cmd => cmd.NewImagingReport.ImagingOrderId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingReport.EmptyImagingOrderId)
                .WithMessage("ImagingOrderId may not be empty.");
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewImagingReport.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.ImagingReport.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }
    }
}
