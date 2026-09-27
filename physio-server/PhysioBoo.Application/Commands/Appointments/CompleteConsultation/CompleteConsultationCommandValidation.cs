using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Appointments.CompleteConsultation
{
    public sealed class CompleteConsultationCommandValidation : AbstractValidator<CompleteConsultationCommand>
    {
        public CompleteConsultationCommandValidation()
        {
            RuleForId();
            RuleForDiagnosis();
            RuleForFollowUpDate();
            RuleForActualDuration();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForDiagnosis()
        {
            RuleFor(cmd => cmd.Consultation.Diagnosis)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Diagnosis may not be empty.");
        }

        // The handler parses this with DateOnly.Parse, so an invalid value must be rejected here.
        public void RuleForFollowUpDate()
        {
            RuleFor(cmd => cmd.Consultation.FollowUpDate)
                .Must(value => DateOnly.TryParse(value, out _))
                .When(cmd => !string.IsNullOrWhiteSpace(cmd.Consultation.FollowUpDate))
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("FollowUpDate is not a valid date.");
        }

        public void RuleForActualDuration()
        {
            RuleFor(cmd => cmd.Consultation.ActualDurationMinutes)
                .GreaterThanOrEqualTo(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("ActualDurationMinutes may not be negative.");
        }
    }
}
