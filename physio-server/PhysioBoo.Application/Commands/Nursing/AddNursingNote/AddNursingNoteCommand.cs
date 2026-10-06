using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.AddNursingNote
{
    public sealed class AddNursingNoteCommand : CommandBase, IRequest
    {
        private static readonly AddNursingNoteCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public AddNursingNoteViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new note.
        public NursingNoteViewModel? Result { get; set; }

        public AddNursingNoteCommand(Guid patientId, AddNursingNoteViewModel input) : base(Guid.NewGuid())
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
