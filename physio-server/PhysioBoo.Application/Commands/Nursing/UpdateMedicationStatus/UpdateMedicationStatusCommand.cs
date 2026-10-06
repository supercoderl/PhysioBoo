using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.Commands.Nursing.UpdateMedicationStatus
{
    // Used by both the nursing MAR and the treatment-sheet medication tab: they edit the same record.
    public sealed class UpdateMedicationStatusCommand : CommandBase, IRequest
    {
        private static readonly UpdateMedicationStatusCommandValidation s_validation = new();

        public Guid EntryId { get; }
        public UpdateMedicationStatusViewModel Input { get; }

        // Filled by the handler; each endpoint maps it to its own view model.
        public MedicationAdministration? Result { get; set; }

        public UpdateMedicationStatusCommand(Guid entryId, UpdateMedicationStatusViewModel input) : base(Guid.NewGuid())
        {
            EntryId = entryId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
