using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.Commands.Nursing.ScheduleMedication
{
    public sealed class ScheduleMedicationCommand : CommandBase, IRequest
    {
        private static readonly ScheduleMedicationCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public ScheduleMedicationViewModel Input { get; }

        // Filled by the handler; each endpoint maps it to its own view model.
        public MedicationAdministration? Result { get; set; }

        public ScheduleMedicationCommand(Guid patientId, ScheduleMedicationViewModel input) : base(Guid.NewGuid())
        {
            PatientId = patientId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
