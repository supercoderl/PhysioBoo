using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabReports.CreateLabReport
{
    public sealed class CreateLabReportCommandValidation : AbstractValidator<CreateLabReportCommand>
    {
        public CreateLabReportCommandValidation()
        {
            RuleForLabOrderId();
            RuleForPatientId();
            RuleForDoctorId();
            RuleForPathologistId();
            RuleForOriginalReportId();
        }

        public void RuleForLabOrderId()
        {
            RuleFor(cmd => cmd.NewLabReport.LabOrderId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabReport.EmptyLabOrderId)
                .WithMessage("LabOrderId may not be empty.");
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewLabReport.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabReport.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewLabReport.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabReport.EmptyDoctorId)
                .WithMessage("DoctorId may not be empty.");
        }

        public void RuleForPathologistId()
        {
            RuleFor(cmd => cmd.NewLabReport.PathologistId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabReport.EmptyPathologistId)
                .WithMessage("PathologistId may not be empty.");
        }

        public void RuleForOriginalReportId()
        {
            RuleFor(cmd => cmd.NewLabReport.OriginalReportId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabReport.EmptyOriginalReportId)
                .WithMessage("OriginalReportId may not be empty.");
        }
    }
}
