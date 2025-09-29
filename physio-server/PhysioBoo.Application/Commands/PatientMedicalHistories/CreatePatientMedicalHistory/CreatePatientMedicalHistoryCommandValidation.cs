using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory
{
    public sealed class CreatePatientMedicalHistoryCommandValidation : AbstractValidator<CreatePatientMedicalHistoryCommand>
    {
        public CreatePatientMedicalHistoryCommandValidation()
        {
            RuleForPatientId();
            RuleForConditionName();
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewPatientMedicalHistory.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PatientMedicalHistory.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForConditionName()
        {
            RuleFor(cmd => cmd.NewPatientMedicalHistory.ConditionName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PatientMedicalHistory.EmptyConditionName)
                .WithMessage("ConditionName may not be empty.");
        }
    }
}
