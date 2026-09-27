using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Doctors.UpdateDoctor
{
    public sealed class UpdateDoctorCommandValidation : AbstractValidator<UpdateDoctorCommand>
    {
        public UpdateDoctorCommandValidation()
        {
            RuleForId();
            RuleForExperience();
            RuleForFees();
            RuleForBookingSettings();
            RuleForLegal();
            RuleForEmploymentStatus();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Doctor.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForExperience()
        {
            RuleFor(cmd => cmd.Doctor.YearsOfExperience).NotNegative("Years of experience");
            RuleFor(cmd => cmd.Doctor.YearsOfPractice).NotNegative("Years of practice");
            RuleFor(cmd => cmd.Doctor.PublicationsCount).NotNegative("Publications count");
            RuleFor(cmd => cmd.Doctor.ConferencePresentations).NotNegative("Conference presentations");
        }

        public void RuleForFees()
        {
            RuleFor(cmd => cmd.Doctor.ConsultationFeeMin).NotNegative("Minimum consultation fee");
            RuleFor(cmd => cmd.Doctor.ConsultationFeeMax).NotNegative("Maximum consultation fee");
            RuleFor(cmd => cmd.Doctor.FollowUpFee).NotNegative("Follow-up fee");
            RuleFor(cmd => cmd.Doctor.EmergencyConsultationFee).NotNegative("Emergency consultation fee");
            RuleFor(cmd => cmd.Doctor.HomeVisitFee).NotNegative("Home visit fee");
            RuleFor(cmd => cmd.Doctor.VideoConsultationFee).NotNegative("Video consultation fee");

            RuleFor(cmd => cmd.Doctor.ConsultationFeeMax)
                .GreaterThanOrEqualTo(cmd => cmd.Doctor.ConsultationFeeMin)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("Maximum consultation fee may not be lower than the minimum.");
        }

        public void RuleForBookingSettings()
        {
            RuleFor(cmd => cmd.Doctor.ConsultationDuration).NotNegative("Consultation duration");
            RuleFor(cmd => cmd.Doctor.BufferTime).NotNegative("Buffer time");
            RuleFor(cmd => cmd.Doctor.AdvanceBookingDays).NotNegative("Advance booking days");
        }

        public void RuleForLegal()
        {
            RuleFor(cmd => cmd.Doctor.PanNumber).MaxLen(20, "PAN number");
            RuleFor(cmd => cmd.Doctor.Gstin).MaxLen(20, "GSTIN");
        }

        public void RuleForEmploymentStatus()
        {
            RuleFor(cmd => cmd.Doctor.EmploymentStatus)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Employment status is invalid.");
        }
    }
}
