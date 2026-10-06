using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.AddVitals
{
    public sealed class AddVitalsCommandValidation : AbstractValidator<AddVitalsCommand>
    {
        public AddVitalsCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.BloodPressureSystolic)
                .InclusiveBetween(40, 300).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("Systolic pressure must be between 40 and 300.");

            RuleFor(c => c.Input.BloodPressureDiastolic)
                .InclusiveBetween(20, 200).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("Diastolic pressure must be between 20 and 200.");

            RuleFor(c => c.Input.HeartRate)
                .InclusiveBetween(20, 300).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("Heart rate must be between 20 and 300.");

            RuleFor(c => c.Input.Temperature)
                .InclusiveBetween(30m, 45m).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("Temperature must be between 30 and 45.");

            RuleFor(c => c.Input.RespiratoryRate)
                .InclusiveBetween(4, 80).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("Respiratory rate must be between 4 and 80.");

            RuleFor(c => c.Input.Spo2)
                .InclusiveBetween(40, 100).WithErrorCode(DomainErrorCodes.Nursing.InvalidVitalValue).WithMessage("SpO2 must be between 40 and 100.");
        }
    }
}
