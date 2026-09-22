
using PhysioBoo.Application.ViewModels.PatientMedicalHistories;


namespace PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory
{
    public sealed class CreatePatientMedicalHistoryCommand : CommandBase, IRequest
    {
        private static readonly CreatePatientMedicalHistoryCommandValidation s_validation = new();

        public CreatePatientMedicalHistoryViewModel NewPatientMedicalHistory { get; }

        public CreatePatientMedicalHistoryCommand(CreatePatientMedicalHistoryViewModel newPatientMedicalHistory) : base(Guid.NewGuid())
        {
            NewPatientMedicalHistory = newPatientMedicalHistory;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
