using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProgressNote
{
    public sealed class AddProgressNoteCommand : CommandBase, IRequest
    {
        private static readonly AddProgressNoteCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public AddProgressNoteViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new note.
        public TreatmentProgressNoteViewModel? Result { get; set; }

        public AddProgressNoteCommand(Guid patientId, AddProgressNoteViewModel input) : base(Guid.NewGuid())
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
